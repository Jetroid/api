const assert = require('assert');
const data_converters = require('../api/helpers/data_converters.js');

//Tests for CSV converter

describe('CSV Converter', function(){

  describe('escaping', function(){
    it('should return a plain string unchanged', function(){
      var strVal = "Plain String.";
      assert.equal(data_converters.escapeCSVCell(strVal), strVal);
    });

    it('should return numerical values as a string version of the value', function(){
      var intVal = 43;
      assert.equal(data_converters.escapeCSVCell(intVal), String(intVal));
    });

    it('should return negative numerical values as a string version of the value', function(){
      var intVal = -84;
      assert.equal(data_converters.escapeCSVCell(intVal), String(intVal));
    });

    it('should return boolean values as a string version of the value', function(){
      var boolVal = true;
      assert.equal(data_converters.escapeCSVCell(boolVal), String(boolVal));
    });

    it('should return null as empty string', function(){
      let nullVal = null;
      assert.equal(data_converters.escapeCSVCell(nullVal), "");
    });

    it('should return undefined as empty string', function(){
      let undefinedVal = undefined;
      assert.equal(data_converters.escapeCSVCell(undefinedVal), "");
    });

    it('should escape comma character', function(){
      var strWithComma = "Oh no, I dislike tests.";
      var strWithEscapedComma = "\"Oh no, I dislike tests.\"";
      assert.equal(data_converters.escapeCSVCell(strWithComma), strWithEscapedComma);
    });

    it('should escape comma character and escape double quotes that should be kept.', function(){
      var strWithComma = '\"Oh no, I dislike tests,\" she said.';
      var strWithEscapedComma = '\"\"\"Oh no, I dislike tests,\"\" she said.\"';
      assert.equal(data_converters.escapeCSVCell(strWithComma), strWithEscapedComma);
    });

    it('should escape pipe character', function(){
      var strWithPipe = "Look at my pipe | I like it";
      var strWithEscapedPipe = '\"Look at my pipe | I like it\"';
      assert.equal(data_converters.escapeCSVCell(strWithPipe), strWithEscapedPipe);
    });
  });

  describe('formatting a list structure', function(){
    it('should give a single string with list elements separated by pipe characters (|)', function(){
      var list = ["ABC","DEF","GHI"];
      var expectedStr = 'ABC|DEF|GHI';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should give a single string with numerical list elements separated by pipe characters (|)', function(){
      var list = [42,256,1048576];
      var expectedStr = '42|256|1048576';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should give an empty string for an empty list', function(){
      var list = [];
      var expectedStr = "";
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should give an empty string in place of a null value in a list', function(){
      var list = ["First", null, "last"];
      var expectedStr = 'First||last';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should respond well to a completely null list', function(){
      var list = [null, null, null];
      var expectedStr = '||';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });

    it('should escape any pipe characters pre-existing in the list', function(){
      var list = ["First", "Last|More Last"];
      var expectedStr = 'First|\"Last|More Last\"';
      assert.equal(data_converters.formatListStructure(list, 0), expectedStr);
    });
  });

  describe('formatting a list of objects', function(){
    it('should separate fields into individual consecutive lists', function(){
      var objList = [{a:"Hello", b:"There", c:"You!"}, {a:"Goodbye", b:"There", c:"Jim"}];
      var expectedStr = 'Hello|Goodbye,There|There,You!|Jim';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should work with numerical values.', function(){
      var objList = [{a:1, b:2, c:3}, {a:4, b:5, c:6}];
      var expectedStr = '1|4,2|5,3|6';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should work with null values', function(){
      var objList = [{a:null, b:null, c:null}, {a:null, b:null, c:null}];
      var expectedStr = '|,|,|';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should work with a mix of types', function(){
      var objList = [{a:"Hello", b:3, c:true}, {a:null, b:-42, c:false}];
      var expectedStr = 'Hello|,3|-42,true|false';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should escape any comma characters', function(){
      var objList = [{a:"Hello", b:3, c:"Words"}, {a:"Goodbye", b:-42, c:"and, More Words"}];
      var expectedStr = 'Hello|Goodbye,3|-42,\"Words|\"\"and, More Words\"\"\"';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should escape pipe characters', function(){
      var objList = [{a:"Hello|Greetings", b:3, c:true}, {a:"Goodbye|Cya later", b:-42, c:false}];
      var expectedStr = '\"\"\"Hello|Greetings\"\"|\"\"Goodbye|Cya later\"\"\",3|-42,true|false';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });

    it('should escape a combination of commas and pipe characters', function(){
      var objList = [{a:"Hello", b:"A, B, and C", c:"Apples|Oranges"}, {a:"Goodbye|Cya", b:"DEF", c:"Melons, and Bananas"}];
      var expectedStr = '\"Hello|\"\"Goodbye|Cya\"\"\",\"\"\"A, B, and C\"\"|DEF\",\"\"\"Apples|Oranges\"\"|\"\"Melons, and Bananas\"\"\"';
      assert.equal(data_converters.formatObjectList(objList, 0), expectedStr);
    });
  });

  describe('header generation',function(){

    const template = {
      "foo":"string",
      "bar":["string"],
      "bat":{
        "bat1":"string",
        "bat2":"string"
      },
      "baz":[{
        "baz1":"string",
        "baz2":"string"
      }],
    };

    it('should cope with primitives, objects, and lists', function(){
      var headers = data_converters.createHeaderForCSV(template);
      var expected = 'foo,bar_list,bat_bat1,bat_bat2,baz_baz1_list,baz_baz2_list';
      assert.equal(headers, expected);
    });

  });

  describe('row generation',function(){

    const template = {
      "foo":"string",
      "bar":["string"],
      "bat":{
        "bat1":"string",
        "bat2":"string"
      },
      "baz":[{
        "baz1":"string",
        "baz2":"string"
      }],
    };

    it('should generate a row for a simple object', function(){

      const obj = {
        "foo":"single Value",
        "bar":["list ele 1", "list ele 2", "list ele 3"],
        "bat":{
          "bat1":"Value inside object 1",
          "bat2":"Value inside object 2"
        },
        "baz":[
          {
            "baz1":"list obj 1 ele 1",
            "baz2":"list obj 1 ele 2"
          },
          {
            "baz1":"list obj 2 ele 1",
            "baz2":"list obj 2 ele 2"
          }
        ],
      };

      var dataRow = data_converters.convertToCSV(obj,"",template);
      var expected = 'single Value,list ele 1|list ele 2|list ele 3,Value inside object 1,Value inside object 2,list obj 1 ele 1|list obj 2 ele 1,list obj 1 ele 2|list obj 2 ele 2';
      assert.equal(dataRow, expected);
    });

    it('should generate row for an object with escape-needing characters', function(){

      const objWithBadCharacters = {
        "foo":"single Value",
        "bar":["list, ele 1", "list ele 2", "list| ele 3"],
        "bat":{
          "bat1":"Value inside, object 1",
          "bat2":"Value| inside object 2"
        },
        "baz":[
          {
            "baz1":"list obj 1, ele 1",
            "baz2":"list obj 1| ele 2"
          },
          {
            "baz1":"list obj 2\" ele 1",
            "baz2":"list obj 2, ele 2"
          }
        ],
      };

      var dataRow = data_converters.convertToCSV(objWithBadCharacters,"",template);
      var expected = 'single Value,\"\"\"list, ele 1\"\"|list ele 2|\"\"list| ele 3\"\"\",\"Value inside, object 1\",\"Value| inside object 2\",\"\"\"list obj 1, ele 1\"\"|\"\"list obj 2\"\" ele 1\"\"\",\"\"\"list obj 1| ele 2\"\"|\"\"list obj 2, ele 2\"\"\"';
      assert.equal(dataRow, expected);
    });

    it('Generate row in file adding in columns for empty fields', function(){
      const objWithEmptyFields = {
        "foo":null,
        "bar":[],
        "bat":{},
        "baz":[],
      };
      var dataRow = data_converters.convertToCSV(objWithEmptyFields,"",template);
      var expected = ',,,,,,';
      assert.equal(dataRow, expected);
    });

    it('Generate row in file adding in columns for missing fields', function(){
      const objWithMissingFields = {};
      var dataRow = data_converters.convertToCSV(objWithEmptyFields,"",template);
      var expected = ',,,,,,';
      assert.equal(dataRow, expected);
    });

  });

});
/*
describe('Filtering function tests:', function(){

  describe('Expected Operation', function(){

    describe('on flat structure', function(){
      it('with single filter', function(){
        obj = { a:"A", b:"B", c:"C", d:"D"};
        filter = { b:null };

        expectedObj = { a:"A", c:"C", d:"D" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('with multiple filter', function(){
        obj = { a:"A", b:"B", c:"C", d:"D" };
        filter = { b:null, d:null };

        expectedObj = { a:"A", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

    describe('on fields in an object', function(){
      it('with single filter', function(){
        obj = { a:"A", b:{ c:"C", d:"D" } };
        filter = { b:{d:null} };

        expectedObj = { a:"A", b:{ c:"C" } };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('with multiple filter', function(){
        obj = { a:"A", b:{ c:"C", d:"D", e:"E" } };
        filter = { b:{ c:"C", d:"D" } };

        expectedObj = { a:"A", b:{ e:"E" } };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('with removing the object', function(){
        obj = { a:"A", b:{ c:"C", d:"D" } };
        filter = { b:null };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

    describe('on list fields', function(){
      it('with single filter', function(){
        obj = { a:"A", b:["B", "BE", "BEE"] };
        filter = { b:null };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

    describe('on fields in an object list', function(){
      it('with single filter', function(){
        obj = { a:"A", b:[{ c:"C", d:"D" }, { c:"C", d:"D" }] };
        filter = { b:{d:null} };

        expectedObj = { a:"A", b:[{ c:"C" }, { c:"C" }] };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('with multiple filter', function(){
        obj = { a:"A", b:[{ c:"C", d:"D", e:"E" }, { c:"C", d:"D", e:"E" }] };
        filter = { b:{ c:"C", d:"D" } };

        expectedObj = { a:"A", b:[{ e:"E" }, { e:"E" }] };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });

      it('with removing the list', function(){
        obj = { a:"A", b:[{ c:"C", d:"D" }, { c:"C", d:"D" }] };
        filter = { b:null };

        expectedObj = { a:"A" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
      });
    });

  });

  describe('Unexpected inputs', function(){
    it('filtering unused fields', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = { d:null };

        expectedObj = { a:"A", b:"B", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('filtering used and unused fields', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = { a:null, d:null };

        expectedObj = { b:"B", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('filtering fields out of order', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = { c:null, a:null };

        expectedObj = { b:"B" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('filtering with an empty filter', function(){
        obj = { a:"A", b:"B", c:"C" };
        filter = {};

        expectedObj = { a:"A", b:"B", c:"C" };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('filtering with an empty object', function(){
        obj = {};
        filter = { a:null };

        expectedObj = {};
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });

    it('attempting to filter fields of a field', function(){
        obj = { a:"A" };
        filter = { a:{b:"B"} };

        expectedObj = { };
        assert.equal(JSON.stringify(data_converters.filterFields(obj, filter)), JSON.stringify(expectedObj));
    });
  });

});

// Run XML based tests
describe('XML TESTS', function() {
  describe('XML syntax', function() {
    it('Test 1 - check if it generates XML', function(){
      var obj = {foo:1};
      var expected = "\t<test>" + "\n" + "  <foo>1</foo>" + "\n" + "</test>\n";
      assert.equal(data_converters.convertObjectToXML(obj, false, false, "test"), expected);
    });

	it('Test 2 - check if it produces doctype', function() {
	  var obj = {foo:2};
	  var expected = '\t<?xml version=\'1.0\'?>\n<tests>\n<test>\n  <foo>2</foo>\n</test>\n';
	  assert.equal(data_converters.convertObjectToXML(obj, true, false, "test"), expected);
    });

	it('Test 3 - check if encloses the data object in correct tag', function() {
	  var obj = {foo:3};
	  var expected = '\t<test>\n' + '  <foo>3</foo>\n' + '</test>\n';
	  assert.equal(data_converters.convertObjectToXML(obj, false, false, "test"), expected);
	});
	it('Test 4 - check if the root tag is closed at the end', function() {
	  var obj = {foo:4};
	  var expected = '\t<test>\n' + '  <foo>4</foo>\n' + '</test>\n\n' + '</tests>';
	  assert.equal(data_converters.convertObjectToXML(obj, false, true, "test"), expected);
	});

	it('Test 5 - check null is returned when the value is null', function() {
	  var obj = {foo:null};
	  var expected = '\t<test>\n' + '  <foo>null</foo>\n' + '</test>\n';
	  assert.equal(data_converters.convertObjectToXML(obj, false, false, "test"), expected);
	});
	it('Test 6 - check special characters are escaped', function() {
	  var obj = {foo:"hello"};
	  var expected = '\t<test>\n  <foo>hello</foo>\n</test>\n';
	  assert.equal(data_converters.convertObjectToXML(obj, false, false, "test"), expected);
	});
	it('Test 7 - check integers are passed', function() {
	  var obj = {foo:1};
	  var expected = '\t<?xml version=\'1.0\'?>\n<tests>\n<test>\n  <foo>1</foo>\n</test>\n'
	  assert.equal(data_converters.convertObjectToXML(obj, true, false, "test"), expected);
	});
   });
});



//Live testing:
let tokens = require("./setupenv");
let app = require("../app");
let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiHelpers = require("./helpers");
let should = chai.should();
let expect = chai.expect;
chai.should();
chai.use(chaiHttp);
chai.use(chaiHelpers);

describe('Case Data', () => {
  describe('Single, unfiltered', () => {
    it('should get one case successfully', async () => {
      const res = await chai.getJSON("/case/1").send({});
      res.should.have.status(200);
      res.body.data.id.should.equal(1);
      //rest of content tested elsewhere, just checking that it works here.
    });

    it('should get one case in CSV format', async () => {
      const res = await chai.request(app).get("/case/1").set('accept','text/csv').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','text/csv; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=case.csv');
      //Probably should add a md5 checksum or something
    });

    it('should get one case in XML format', async () => {
      const res = await chai.request(app).get("/case/1").set('accept','application/xml').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','application/xml; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=case.xml');
      //Probably should add a md5 checksum or something
    });

  });

  describe('Single, filtered', () => {
    const filter1 = "{%22id%22%3Anull}"
    const filter2 = "{%22type%22%3Anull%2C%22location%22%3A{%22latitude%22%3Anull}}"

    it('should get one case with id filtered out', async () => {
      const res = await chai.getJSON("/case/1?filter="+filter1).send({});
      res.should.have.status(200);
      (typeof res.body.data.id).should.equal('undefined');
      res.body.data.type.should.equal('case');
    });

    it('should get one case with type and latitude filtered out', async () => {
      const res = await chai.getJSON("/case/1?filter="+filter2).send({});
      res.should.have.status(200);
      (typeof res.body.data.type).should.equal('undefined');
      (typeof res.body.data.location.latitude).should.equal('undefined');
      (typeof res.body.data.location).should.equal('object');
      res.body.data.id.should.equal(1);
    });
  });

  describe('All, unfiltered', () => {
    it('should get all cases successfully', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/case/all").send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many cases are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);
      res.body.data[0].id.should.equal(1);
      //rest of content tested elsewhere, just checking that it works here.

    });

    it('should get all cases in CSV format', async function(){
      this.timeout(10000);

      const res = await chai.request(app).get("/case/all").set('accept','text/csv').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','text/csv; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=allcases.csv');
      //Probably should add a md5 checksum or something
    });

    it('should get all cases in XML format', async function(){
      this.timeout(10000);

      const res = await chai.request(app).get("/case/all").set('accept','application/xml').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','application/xml; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=allcases.xml');
      //Probably should add a md5 checksum or something
    });

  });

  describe('All, filtered', () => {
    const filter1 = "{%22id%22%3Anull}"
    const filter2 = "{%22type%22%3Anull%2C%22location%22%3A{%22latitude%22%3Anull}}"

    it('should get all cases successfully, with id filtered out of all cases.', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/case/all?filter="+filter1).send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many cases are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);

      for (var i = 0; i < res.body.length/2; i++){
        res.body.data[i].type.should.equal('case');
        (typeof res.body.data[i].id).should.equal('undefined');
      }
      //rest of content tested elsewhere, just checking that it works here.

    });

    it('should get all cases successfully, with type and location.latitude removed.', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/case/all?filter="+filter2).send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many cases are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);

      for (var i = 0; i < res.body.length/2; i++){
        (typeof res.body.data[i].id).should.equal('number');
        (typeof res.body.data[i].type).should.equal('undefined');
        (typeof res.body.data[i].location).should.equal('object');
        (typeof res.body.data[i].location.latitude).should.equal('undefined');
        (typeof res.body.data[i].location.longitude).should.equal('string');
      }
      //rest of content tested elsewhere, just checking that it works here.

    });
  });

  describe('getting fields', () => {
    it('should be the same as the template.', async function(){
      const res = await chai.getJSON("/case/fields").send({});
      res.should.have.status(200);

      const templ = templates.caseTemplate;
      assert.equal(JSON.stringify(res.body), JSON.stringify(templ));
    });
  });

});

describe('method Data', () => {
  describe('Single, unfiltered', () => {
    it('should get one method successfully', async () => {
      const res = await chai.getJSON("/method/145").send({});
      res.should.have.status(200);
      res.body.data.id.should.equal(145);
      //rest of content tested elsewhere, just checking that it works here.
    });

    it('should get one method in CSV format', async () => {
      const res = await chai.request(app).get("/method/145").set('accept','text/csv').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','text/csv; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=method.csv');
      //Probably should add a md5 checksum or something
    });

    it('should get one method in XML format', async () => {
      const res = await chai.request(app).get("/method/145").set('accept','application/xml').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','application/xml; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=method.xml');
      //Probably should add a md5 checksum or something
    });

  });

  describe('Single, filtered', () => {
    const filter1 = "{%22id%22%3Anull}"
    const filter2 = "{%22type%22%3Anull%2C%22location%22%3A{%22latitude%22%3Anull}}"

    it('should get one method with id filtered out', async () => {
      const res = await chai.getJSON("/method/145?filter="+filter1).send({});
      res.should.have.status(200);
      (typeof res.body.data.id).should.equal('undefined');
      res.body.data.type.should.equal('method');
    });

    it('should get one method with type and latitude filtered out', async () => {
      const res = await chai.getJSON("/method/145?filter="+filter2).send({});
      res.should.have.status(200);
      (typeof res.body.data.type).should.equal('undefined');
      (typeof res.body.data.location.latitude).should.equal('undefined');
      (typeof res.body.data.location).should.equal('object');
      res.body.data.id.should.equal(145);
    });
  });

  describe('All, unfiltered', () => {
    it('should get all methods successfully', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/method/all").send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many methods are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);
      res.body.data[0].id.should.equal(145);
      //rest of content tested elsewhere, just checking that it works here.

    });

    it('should get all methods in CSV format', async function(){
      this.timeout(10000);

      const res = await chai.request(app).get("/method/all").set('accept','text/csv').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','text/csv; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=allmethods.csv');
      //Probably should add a md5 checksum or something
    });

    it('should get all methods in XML format', async function(){
      this.timeout(10000);

      const res = await chai.request(app).get("/method/all").set('accept','application/xml').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','application/xml; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=allmethods.xml');
      //Probably should add a md5 checksum or something
    });

  });

  describe('All, filtered', () => {
    const filter1 = "{%22id%22%3Anull}"
    const filter2 = "{%22type%22%3Anull%2C%22location%22%3A{%22latitude%22%3Anull}}"

    it('should get all methods successfully, with id filtered out of all methods.', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/method/all?filter="+filter1).send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many methods are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);

      for (var i = 0; i < res.body.length/2; i++){
        res.body.data[i].type.should.equal('method');
        (typeof res.body.data[i].id).should.equal('undefined');
      }
      //rest of content tested elsewhere, just checking that it works here.

    });

    it('should get all methods successfully, with type and location.latitude removed.', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/method/all?filter="+filter2).send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many methods are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);

      for (var i = 0; i < res.body.length/2; i++){
        (typeof res.body.data[i].id).should.equal('number');
        (typeof res.body.data[i].type).should.equal('undefined');
        (typeof res.body.data[i].location).should.equal('object');
        (typeof res.body.data[i].location.latitude).should.equal('undefined');
        (typeof res.body.data[i].location.longitude).should.equal('string');
      }
      //rest of content tested elsewhere, just checking that it works here.

    });
  });

  describe('getting fields', () => {
    it('should be the same as the template.', async function(){
      const res = await chai.getJSON("/method/fields").send({});
      res.should.have.status(200);

      const templ = templates.methodTemplate;
      assert.equal(JSON.stringify(res.body), JSON.stringify(templ));
    });
  });

});


describe('organization Data', () => {
  describe('Single, unfiltered', () => {
    it('should get one organization successfully', async () => {
      const res = await chai.getJSON("/organization/199").send({});
      res.should.have.status(200);
      res.body.data.id.should.equal(199);
      //rest of content tested elsewhere, just checking that it works here.
    });

    it('should get one organization in CSV format', async () => {
      const res = await chai.request(app).get("/organization/199").set('accept','text/csv').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','text/csv; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=organization.csv');
      //Probably should add a md5 checksum or something
    });

    it('should get one organization in XML format', async () => {
      const res = await chai.request(app).get("/organization/199").set('accept','application/xml').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','application/xml; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=organization.xml');
      //Probably should add a md5 checksum or something
    });

  });

  describe('Single, filtered', () => {
    const filter1 = "{%22id%22%3Anull}"
    const filter2 = "{%22type%22%3Anull%2C%22location%22%3A{%22latitude%22%3Anull}}"

    it('should get one organization with id filtered out', async () => {
      const res = await chai.getJSON("/organization/199?filter="+filter1).send({});
      res.should.have.status(200);
      (typeof res.body.data.id).should.equal('undefined');
      res.body.data.type.should.equal('organization');
    });

    it('should get one organization with type and latitude filtered out', async () => {
      const res = await chai.getJSON("/organization/199?filter="+filter2).send({});
      res.should.have.status(200);
      (typeof res.body.data.type).should.equal('undefined');
      (typeof res.body.data.location.latitude).should.equal('undefined');
      (typeof res.body.data.location).should.equal('object');
      res.body.data.id.should.equal(199);
    });
  });

  describe('All, unfiltered', () => {
    it('should get all organizations successfully', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/organization/all").send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many organizations are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);
      res.body.data[0].id.should.equal(199);
      //rest of content tested elsewhere, just checking that it works here.

    });

    it('should get all organizations in CSV format', async function(){
      this.timeout(10000);

      const res = await chai.request(app).get("/organization/all").set('accept','text/csv').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','text/csv; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=allorganizations.csv');
      //Probably should add a md5 checksum or something
    });

    it('should get all organizations in XML format', async function(){
      this.timeout(10000);

      const res = await chai.request(app).get("/organization/all").set('accept','application/xml').send({});
      res.should.have.status(200);
      expect(res).to.have.header('content-type','application/xml; charset=utf-8');
      expect(res).to.have.header('content-disposition','attachment; filename=allorganizations.xml');
      //Probably should add a md5 checksum or something
    });

  });

  describe('All, filtered', () => {
    const filter1 = "{%22id%22%3Anull}"
    const filter2 = "{%22type%22%3Anull%2C%22location%22%3A{%22latitude%22%3Anull}}"

    it('should get all organizations successfully, with id filtered out of all organizations.', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/organization/all?filter="+filter1).send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many organizations are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);

      for (var i = 0; i < res.body.length/2; i++){
        res.body.data[i].type.should.equal('organization');
        (typeof res.body.data[i].id).should.equal('undefined');
      }
      //rest of content tested elsewhere, just checking that it works here.

    });

    it('should get all organizations successfully, with type and location.latitude removed.', async function(){
      this.timeout(10000);

      const res = await chai.getJSON("/organization/all?filter="+filter2).send({});
      res.should.have.status(200);
      Array.isArray(res.body.data).should.equal(true);
      //Not sure how many organizations are in database //TODO check that
      expect(res.body.data).to.have.lengthOf.above(2);

      for (var i = 0; i < res.body.length/2; i++){
        (typeof res.body.data[i].id).should.equal('number');
        (typeof res.body.data[i].type).should.equal('undefined');
        (typeof res.body.data[i].location).should.equal('object');
        (typeof res.body.data[i].location.latitude).should.equal('undefined');
        (typeof res.body.data[i].location.longitude).should.equal('string');
      }
      //rest of content tested elsewhere, just checking that it works here.

    });
  });

  describe('getting fields', () => {
    it('should be the same as the template.', async function(){
      const res = await chai.getJSON("/organization/fields").send({});
      res.should.have.status(200);

      const templ = templates.organizationTemplate;
      assert.equal(JSON.stringify(res.body), JSON.stringify(templ));
    });
  });

});
*/

