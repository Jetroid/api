const assert = require('assert');
const CSVConverter = require('../api/helpers/JSONToCSVCaseConverter.js');
const { filterFields } = require('../api/helpers/things.js');

//Tests for CSV converter

describe('CSV Converter Functions', function(){
    
    describe('Prepare Value function.', function(){
        it('Should return string unchanged.', function(){
            var strVal = "Hello this is a test.";
            assert.equal(strVal, CSVConverter.prepareValue(strVal));
        });
        
        it('Should return numerical values as a string version of the value.', function(){
            var intVal = 43;
            assert.equal(String(intVal), CSVConverter.prepareValue(intVal));
        });
        
        it('Should return negative numerical values as a string version of the value.', function(){
            var intVal = -84;
            assert.equal(String(intVal), CSVConverter.prepareValue(intVal));
        });
        
        it('Should return boolean values as a string version of the value.', function(){
            var boolVal = true;
            assert.equal(String(boolVal), CSVConverter.prepareValue(boolVal));
        });
        
        it('Should return empty string for null value.', function(){
            let nullVal;
            assert.equal("", CSVConverter.prepareValue(nullVal));
        });
        
        it('Comma character should be escaped', function(){
            var strWithComma = "Oh no, I dislike tests.";
            var strWithEscapedComma = "\"Oh no, I dislike tests.\"";    //Excel friendly (Assumed best based on use cases?)
            //var strWithEscapedComma = "Oh no\, I dislike tests.";     //Unix friendly
            assert.equal(strWithEscapedComma, CSVConverter.prepareValue(strWithComma));
        });

	    it('Comma character should be escaped and escape double quotes that should be kept.', function(){
            var strWithComma = '"Oh no, I dislike tests," she said.';
            var strWithEscapedComma = '"""Oh no, I dislike tests,"" she said."';    //Excel friendly (Assumed best based on use cases?)
            assert.equal(strWithEscapedComma, CSVConverter.prepareValue(strWithComma));
        });
        
        it('Pipe character should be escaped', function(){
            var strWithPipe = "Look at my pipe | I like it";
            var strWithEscapedPipe = '"Look at my pipe | I like it"';
            assert.equal(strWithEscapedPipe, CSVConverter.prepareValue(strWithPipe));
        });
    });
    
    describe('Format List Tests', function(){
        it('Should give a single string with list elements separated by pipe characters (|)', function(){
            var list = ["ABC","DEF","GHI"];
            var expectedStr = '"ABC|DEF|GHI"';
            assert.equal(expectedStr, CSVConverter.formatListStructure(list));
        });
        
        it('Should give a single string with numerical list elements separated by pipe characters (|)', function(){
            var list = [42,256,1048576];
            var expectedStr = '"42|256|1048576"';
            assert.equal(expectedStr, CSVConverter.formatListStructure(list));
        });
        
        it('Should give an empty string for an empty list', function(){
            var list = [];
            var expectedStr = "";
            assert.equal(expectedStr, CSVConverter.formatListStructure(list));
        });
        
        it('Should give an empty string in place of a null value in a list', function(){
            var list = ["First", null, "last"];
            var expectedStr = '"First||last"';
            assert.equal(expectedStr, CSVConverter.formatListStructure(list));
        });
        
        it('Should escape any pipe characters pre-existing in the list.', function(){
            var list = ["First", "Last|More Last"];
            var expectedStr = '"First|""Last|More Last"""';
            assert.equal(expectedStr, CSVConverter.formatListStructure(list));
        });
    });
    
    describe('Format Object List Tests', function(){
        it('Should separate fields into individual consecutive lists.', function(){
            var objList = [{a:"Hello", b:"There", c:"You!"}, {a:"Goodbye", b:"There", c:"Jim"}];
            var expectedStr = '"Hello|Goodbye","There|There","You!|Jim"';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });

        it('Should work with numerical values.', function(){
            var objList = [{a:1, b:2, c:3}, {a:4, b:5, c:6}];
            var expectedStr = '"1|4","2|5","3|6"';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });

        it('Should work with null values', function(){
            var objList = [{a:null, b:null, c:null}, {a:null, b:null, c:null}];
            var expectedStr = '"|","|","|"';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });

        it('Should work with a mix of types', function(){
            var objList = [{a:"Hello", b:3, c:true}, {a:null, b:-42, c:false}];
            var expectedStr = '"Hello|","3|-42","true|false"';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });

        it('Should escape any comma characters, without affecting surrounding columns', function(){
            var objList = [{a:"Hello", b:3, c:"Words"}, {a:"Goodbye", b:-42, c:"and, More Words"}];
            var expectedStr = '"Hello|Goodbye","3|-42","Words|""and, More Words"""';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });

        it('Should escape Pipe charcters', function(){
            var objList = [{a:"Hello|Greetings", b:3, c:true}, {a:"Goodbye|Cya later", b:-42, c:false}];
            var expectedStr = '"""Hello|Greetings""|""Goodbye|Cya later""","3|-42","true|false"';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });

        it('Should escape a combination of commas and pipe characters', function(){
            var objList = [{a:"Hello", b:"A, B, and C", c:"Apples|Oranges"}, {a:"Goodbye|Cya", b:"DEF", c:"Melons, and Bananas"}];
            var expectedStr = '"Hello|""Goodbye|Cya""","""A, B, and C""|DEF","""Apples|Oranges""|""Melons, and Bananas"""';
            assert.equal(expectedStr, CSVConverter.formatObjectList(objList));
        });
    });
    
    describe('Format full thing',function(){
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
            ]
        }
    
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
                "baz1":"list obj 2; ele 1",
                "baz2":"list obj 2, ele 2"
            }
            ],
            "nullVal":null,
            "emptyList":[]
        }
    
        const objWithEmptyAuthors = {
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
            "authors":[]
        }
    
        it('Generate Headers', function(){
            var headers = CSVConverter.findColumnHeadingsForStructure(obj);
            var expected = 'foo,bar_list,bat_bat1,bat_bat2,baz_baz1_list,baz_baz2_list';
            assert.equal(headers, expected);
        });
    
        it('Generate Headers with null value fields', function(){
            var headers = CSVConverter.findColumnHeadingsForStructure(objWithBadCharacters);
            var expected = 'foo,bar_list,bat_bat1,bat_bat2,baz_baz1_list,baz_baz2_list,nullVal,emptyList_list';
            assert.equal(headers, expected);
        });
        
        it('Generate Headers with author list column headers', function(){
            var headers = CSVConverter.findColumnHeadingsForStructure(objWithEmptyAuthors);
            var expected = 'foo,bar_list,bat_bat1,bat_bat2,baz_baz1_list,baz_baz2_list,authors_user_id_list,authors_timestamp_list,authors_name_list';
            assert.equal(headers, expected);
        });
    
        it('Generate row in file', function(){
            var dataRow = CSVConverter.formatGenericStructure(obj);
            var expected = 'single Value,"list ele 1|list ele 2|list ele 3",Value inside object 1,Value inside object 2,"list obj 1 ele 1|list obj 2 ele 1","list obj 1 ele 2|list obj 2 ele 2"';
            assert.equal(dataRow, expected);
        });
        
        it('Generate row in file with escaped characters', function(){
            var dataRow = CSVConverter.formatGenericStructure(objWithBadCharacters);
            var expected = 'single Value,"""list, ele 1""|list ele 2|""list| ele 3""","Value inside, object 1","Value| inside object 2","""list obj 1, ele 1""|""list obj 2; ele 1""","""list obj 1| ele 2""|""list obj 2, ele 2""",,';
            assert.equal(dataRow, expected);
        });
        
        it('Generate row in file adding in columns for empty author list', function(){
            var dataRow = CSVConverter.formatGenericStructure(objWithEmptyAuthors);
            var expected = 'single Value,"list ele 1|list ele 2|list ele 3",Value inside object 1,Value inside object 2,"list obj 1 ele 1|list obj 2 ele 1","list obj 1 ele 2|list obj 2 ele 2",,,';
            assert.equal(dataRow, expected);
        });
    });
});


describe('Filtering function tests', function(){
    
    describe('Expected Operation', function(){
        it('Operation on flat structure, single filter', function(){
            obj = { a:"A", b:"B", c:"C" };
            filter = { b:null };
            
            expectedObj = { a:"A", c:"C" };
            assert.equal(filterFields(obj, filter), expectedObj);
        });
        
        it('Operation on flat structure, single filter', function(){
            obj = { a:"A", b:"B", c:"C", d:"D" };
            filter = { b:null, d:null };
            
            expectedObj = { a:"A", c:"C" };
            assert.equal(filterFields(obj, filter), expectedObj);
        });
    });
    
});










