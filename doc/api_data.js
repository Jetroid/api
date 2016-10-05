define({ "api": [  {    "type": "get",    "url": "/case/countsByCountry",    "title": "Get case counts for each country",    "group": "Cases",    "version": "0.1.0",    "name": "countsByCountry",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "OK",            "description": "<p>true if call was successful</p>"          },          {            "group": "Success 200",            "type": "String[]",            "optional": false,            "field": "errors",            "description": "<p>List of error strings (when <code>OK</code> is false)</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Mapping of country names to counts (when <code>OK</code> is true)</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n  \"OK\": true,\n  \"data\": {\n     countryCounts: {\n       \"United States\": 122,\n       \"United Kingdom\": 57,\n       \"Italy\": 51,\n       ...\n   }\n}",          "type": "json"        }      ]    },    "filename": "api/controllers/case.js",    "groupTitle": "Cases"  },  {    "type": "delete",    "url": "/case/:caseId",    "title": "Delete a case",    "group": "Cases",    "version": "0.1.0",    "name": "deleteCase",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "caseId",            "description": "<p>Case ID</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "OK",            "description": "<p>true if call was successful</p>"          },          {            "group": "Success 200",            "type": "String[]",            "optional": false,            "field": "errors",            "description": "<p>List of error strings (when <code>OK</code> is false)</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n   OK: true\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthenticated",            "description": "<p>The user is not authenticated</p>"          },          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthorized",            "description": "<p>The user doesn't have permission to perform this operation.</p>"          }        ]      }    },    "filename": "api/controllers/case.js",    "groupTitle": "Cases"  },  {    "type": "put",    "url": "/case/:caseId",    "title": "Submit a new version of a case",    "group": "Cases",    "version": "0.1.0",    "name": "editCase",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "caseId",            "description": "<p>Case ID</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "OK",            "description": "<p>true if call was successful</p>"          },          {            "group": "Success 200",            "type": "String[]",            "optional": false,            "field": "errors",            "description": "<p>List of error strings (when <code>OK</code> is false)</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>case data</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n  \"OK\": true,\n  \"data\": {\n    \"ID\": 3,\n    \"Description\": 'foo'\n   }\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthenticated",            "description": "<p>The user is not authenticated</p>"          },          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthorized",            "description": "<p>The user doesn't have permission to perform this operation.</p>"          }        ]      }    },    "filename": "api/controllers/case.js",    "groupTitle": "Cases"  },  {    "type": "get",    "url": "/case/:caseId",    "title": "Get the last version of a case",    "group": "Cases",    "version": "0.1.0",    "name": "getCaseById",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "Number",            "optional": false,            "field": "caseId",            "description": "<p>Case ID</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "OK",            "description": "<p>true if call was successful</p>"          },          {            "group": "Success 200",            "type": "String[]",            "optional": false,            "field": "errors",            "description": "<p>List of error strings (when <code>OK</code> is false)</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>case data</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n  \"OK\": true,\n  \"data\": {\n    \"ID\": 3,\n    \"Description\": 'foo'\n   }\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthenticated",            "description": "<p>The user is not authenticated</p>"          },          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthorized",            "description": "<p>The user doesn't have permission to perform this operation.</p>"          }        ]      }    },    "filename": "api/controllers/case.js",    "groupTitle": "Cases"  },  {    "type": "post",    "url": "/case/new",    "title": "Create new case",    "group": "Cases",    "version": "0.1.0",    "name": "newCase",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "OK",            "description": "<p>true if call was successful</p>"          },          {            "group": "Success 200",            "type": "String[]",            "optional": false,            "field": "errors",            "description": "<p>List of error strings (when <code>OK</code> is false)</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>case data</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n  \"OK\": true,\n  \"data\": {\n    \"ID\": 3,\n    \"Description\": 'foo'\n   }\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthenticated",            "description": "<p>The user is not authenticated</p>"          },          {            "group": "Error 4xx",            "optional": false,            "field": "NotAuthorized",            "description": "<p>The user doesn't have permission to perform this operation.</p>"          }        ]      }    },    "filename": "api/controllers/case.js",    "groupTitle": "Cases"  },  {    "type": "get",    "url": "/case/search",    "title": "Search through the cases",    "group": "Cases",    "version": "0.1.0",    "name": "search",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "query",            "description": "<p>query term</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "sortingMethod",            "description": "<p>('chronological' or 'alphabetical' or 'featured')</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "selectedCategory",            "description": "<p>('All' or 'Case' or 'Method' or 'Organization' or 'News')</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Boolean",            "optional": false,            "field": "OK",            "description": "<p>true if call was successful</p>"          },          {            "group": "Success 200",            "type": "String[]",            "optional": false,            "field": "errors",            "description": "<p>List of error strings (when <code>OK</code> is false)</p>"          },          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "data",            "description": "<p>Mapping of country names to counts (when <code>OK</code> is true)</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n  \"OK\": true,\n  \"data\": {\n     ... (ElasticSearch records) ...\n  }\n}",          "type": "json"        }      ]    },    "filename": "api/controllers/case.js",    "groupTitle": "Cases"  }] });
