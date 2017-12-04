"use strict";
const express = require("express");
const router = express.Router(); // eslint-disable-line new-cap
const cache = require("apicache");
const log = require("winston");
const xml2js = require("xml2js");
const json2xmlparser = require("js2xmlparser");
const xmlBuilder = require('xmlbuilder');

const { db, sql, as } = require("../helpers/db");

const {
  getEditXById,
  addRelatedList,
  returnThingByRequest,
  returnSingleThingByRequest,
  returnAllThingsByRequest,
  getThingByRequest,
  getThingByType_id_lang_userId
} = require("../helpers/things");

const {
  convertToCSV,
  convertObjectToCSV,
  formatGenericStructure,
  findColumnHeadingsForStructure
} = require("../helpers/JSONToCSVCaseConverter");

const CASES_BY_COUNTRY = sql("../sql/cases_by_country.sql");
const CREATE_CASE = sql("../sql/create_case.sql");
const IDS_FOR_TYPE = sql("../sql/ids_for_type.sql");

/**
 * @api {get} /case/countsByCountry Get case counts for each country
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName countsByCountry
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data Mapping of country names to counts (when `OK` is true)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *          countryCounts: {
 *            "United States": 122,
 *            "United Kingdom": 57,
 *            "Italy": 51,
 *            ...
 *        }
 *     }
 * })
 */

// TODO: figure out if the choropleth should show cases or all things

router.get("/countsByCountry", async function getCountsByCountry(req, res) {
  try {
    const countries = await db.any(CASES_BY_COUNTRY);
    // convert array to object
    let countryCounts = {};
    countries.forEach(function(row) {
      countryCounts[row.country.toLowerCase()] = row.count;
    });
    res.status(200).json({
      OK: true,
      data: { countryCounts: countryCounts }
    });
  } catch (error) {
    log.error("Exception in /case/countsByCountry => %s", error);
    res.status(500).json({ OK: false, error: error });
  }
});

/**
 * @api {post} /case/new Create new case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName newCase
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.post("/new", async function postNewCase(req, res) {
  // create new `case` in db
  // req.body:
  /*
  {
     "title":"Safer Jam",
     "body":"Dangerous Body",
     "vidURL":"https://www.youtube.com/watch?v=QF7g3rCnD-w",
     "location":{
        "label":"Cleveland, OH, United States",
        "placeId":"ChIJLWto4y7vMIgRQhhi91XLBO0",
        "isFixture":false,
        "gmaps":{
           "address_components":[
              {
                 "long_name":"Cleveland",
                 "short_name":"Cleveland",
                 "types":[
                    "locality",
                    "political"
                 ]
              },
              {
                 "long_name":"Cuyahoga County",
                 "short_name":"Cuyahoga County",
                 "types":[
                    "administrative_area_level_2",
                    "political"
                 ]
              },
              {
                 "long_name":"Ohio",
                 "short_name":"OH",
                 "types":[
                    "administrative_area_level_1",
                    "political"
                 ]
              },
              {
                 "long_name":"United States",
                 "short_name":"US",
                 "types":[
                    "country",
                    "political"
                 ]
              }
           ],
           "formatted_address":"Cleveland, OH, USA",
           "geometry":{
              "bounds":{
                 "south":41.390628,
                 "west":-81.87897599999997,
                 "north":41.604436,
                 "east":-81.53274390000001
              },
              "location":{
                 "lat":41.49932,
                 "lng":-81.69436050000002
              },
              "location_type":"APPROXIMATE",
              "viewport":{
                 "south":41.390628,
                 "west":-81.87897599999997,
                 "north":41.5992571,
                 "east":-81.53274390000001
              }
           },
           "place_id":"ChIJLWto4y7vMIgRQhhi91XLBO0",
           "types":[
              "locality",
              "political"
           ]
        },
        "location":{
           "lat":41.49932,
           "lng":-81.69436050000002
        }
     }
  }
  */
  try {
    cache.clear();

    let title = req.body.title;
    let body = req.body.body || req.body.summary || "";
    let language = req.params.language || "en";
    if (!title) {
      return res.status(400).json({
        message: "Cannot create Case without at least a title"
      });
    }
    const user_id = req.user.user_id;
    const thing = await db.one(CREATE_CASE, {
      title,
      body,
      language
    });
    req.thingid = thing.thingid;
    return getEditXById("case")(req, res);
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
    return res.status(500).json({ OK: false, error: error });
  }
  // Refresh search index
  try {
    await db.none("REFRESH MATERIALIZED VIEW search_index_en;");
  } catch (error) {
    log.error("Exception in POST /case/new => %s", error);
  }
});

/**
 * @api {put} /case/:caseId  Submit a new version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName editCase
 * @apiParam {Number} caseId Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.put("/:thingid", getEditXById("case"));

/**
 * @api {get} /case/:thingid Get the last version of a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName returnCaseById
 * @apiParam {Number} thingid Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 * @apiSuccess {Object} data case data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "OK": true,
 *       "data": {
 *         "ID": 3,
 *         "Description": 'foo'
 *        }
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

// We want to extract the user ID from the auth token if it's there,
// but not fail if not.
router.get("/:thingid", function getCaseData(req, res){
    try{
        //Determine the converter to use. Normal JSON as default.
        var converterFunction;
        if (req.accepts('application/json')){
            converterFunction = function(thing, first, last){return { OK: true, data: thing }};
        }else if(req.accepts('application/xml')){
            //converterFunction = convertObjectToXML;  //TODO
        }else if(req.accepts('text/csv')){
            converterFunction = convertObjectToCSV;
        }

        const filterJSON = req.body;
        
        if(req.params.thingid != 'all'){
            returnSingleThingByRequest("case",req,res,converterFunction,filterJSON);
        }else{
            returnAllThingsByRequest("case",req,res,converterFunction,filterJSON);
        }
    }catch (error){
        log.error("Exception in GET case data", req.params.thingid, error);
        res.status(500).json({ OK: false, error: error });
    }
});

/**
 * @api {delete} /case/:caseId Delete a case
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName deleteCase
 * @apiParam {Number} caseId Case ID
 *
 * @apiSuccess {Boolean} OK true if call was successful
 * @apiSuccess {String[]} errors List of error strings (when `OK` is false)
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        OK: true
 *     }
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.delete("/:thingid", function editCaseById(req, res) {
  cache.clear();
  // let caseId = req.swagger.params.caseId.value;
  // let caseBody = req.body;
  res.status(200).json(req.body);
});


/**
 * @api {get} /case/csv/:thingid Get a single case in CSV format
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName returnCaseCsvById
 * @apiParam {Number} caseID Case ID
 *
 * @apiSuccess {attachment} case.csv Data for the case with this ID
 *
 * @apiSuccessExample Success-attachment
 *     id,type,original_language,...
 *     3,case,en,...
 *
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */

router.get("/csv/:thingid", async function returnCSVCase(req, res) {
  try {
    const caseObj = await getThingByRequest("case", req);
    res.setHeader('content-type', 'text/csv');
    res.setHeader('content-disposition', 'attachment; filename=case.csv');
    res.status(200).send(convertToCSV([caseObj]));
    //res.status(200).json({OK: true, data: JSON.stringify(caseObj)});
  } catch (error) {
    log.error("Exception in GET CSV case data", req.params.thingid, error);
    res.status(500).json({ OK: false, error: error});
  }
});


/**
 * @api {get} /case/all/csv Get data for all cases in CSV format
 * @apiGroup Cases
 * @apiVersion 0.1.0
 * @apiName returnAllCasesCsv
 *
 * @apiSuccess {attachment} allcases.csv Data for all cases in Participedia
 *
 * @apiSuccessExample Success-attachment
 *     id,type,original_language,...
 *     3,case,en,...
 *     43,case,en,...
 *     82,case,en,...
 *     ...
 *
 * @apiError NotAuthenticated The user is not authenticated
 * @apiError NotAuthorized The user doesn't have permission to perform this operation.
 *
 */
 router.get("/all/csv", async function returnAllCSVCases(req, res) {
  try {
    const thingtype = "case";
    const ids = await db.any(IDS_FOR_TYPE, { thingtype });
    res.setHeader('content-type', 'text/csv');
    res.setHeader('content-disposition', 'attachment; filename=allcases.csv');
    var headersSent = false;
    var counter = 0;

    ids.forEach(async function(row){
        req.params.thingid = Number(row.id);
        const caseObj = await getThingByRequest("case", req);
        if (!headersSent){
            res.write(findColumnHeadingsForStructure(caseObj)+"\n");
            headersSent = true;
        }
        res.write(formatGenericStructure(caseObj)+"\n");
        counter++;
        if (counter == ids.length){
            res.end();
        }
    });
  } catch (error) {
    log.error("Exception in GET all CSV case data", req.params.thingid, error);
    res.status(500).json({ OK: false, error: error });
  }
});
 
 
router.get("/xml/:thingid", async function returnXMLCase(req, res) {
  try {
    const caseObj = await getThingByRequest("case", req);
    const xmlObj = json2xmlparser.parse("case", caseObj);
    res.setHeader('content-type','text/xml');
    res.set({"Content-Type": "text/xml", "Content-Disposition": "attachment; filename=\"" + req.params.thingid + "\".xml"});
    //res.status(200).send(xmlObj);
    //res.write("Hello World! This is a test! |");
    res.write(xmlObj);	  
    res.end();
  } catch (error) {
    log.error("Exception in GET XML case data", req.params.thingid, error);
    res.status(500).json({ OK: false, error: error});
  }
});

const convertObjToXML = function(jsonObj, first, last) {
    //const xmlObject = json2xmlparser.parse("case", jsonObj, {declaration:{include:false}});
    const xmlObject = json2xmlparser.parse("case", jsonObj);
    var head = xmlObject.substr(0, xmlObject.indexOf("\n"));
    var data = xmlObject.substr(xmlObject.indexOf("\n")+1);
    var out = "";	
    if(first) {
	out = out + head;
        out = out + "\n" +  "<cases>" + "\n";	    
    } 

    out = "\t" + out + data + "\n";

    if(last) {
        out = out + "\n" +  "</cases>";
    }

    return out;
	
}

router.get("/all/xml", async function returnAllXML(req, res) {
  try { 
    const thingtype = "case";  
    const uniqID = await db.any(IDS_FOR_TYPE, { thingtype });
    res.setHeader('content-type','text/xml');
    res.set({"Content-Disposition":"attachment; filename=allCases.xml"});
    var counter = 0; 
   
    uniqID.forEach(async function(row) {
	req.params.thingid = Number(row.id);
        const caseObj = await getThingByRequest("case", req);
        const xmlData = convertObjToXML(caseObj, counter==0, counter==uniqID.length -1);  
	res.write(xmlData);
	counter++;    
	if(counter == uniqID.length) {
	    res.end();
	}	

    });
		
  } catch(error) {
    log.error("Exception in GET all XML case data", req.params.thingid, error);
    res.status(500).json({ OK: false, error: error });
  }

});

module.exports = router;
