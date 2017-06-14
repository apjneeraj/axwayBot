'use strict';

    // Close dialog with the customer, reporting fulfillmentState of Failed or Fulfilled
    function close(sessionAttributes, fulfillmentState, message,responseCard) {
        return {
            sessionAttributes,
            dialogAction: {
                type: 'Close',
                fulfillmentState,
                message,
                responseCard
            },
        };
    }

    //-----------------Products ---------------------

    function products(intentRequest,callback,productName,typeofData) {

      const sessionAttributes = intentRequest.sessionAttributes;
      const csvFilePath='Product_Sheet.csv'
      const csv=require('csvtojson')
      var listOfProducts = [];
      var productDesc = "";
      //var pVersion_Or_SP_Level = "";

      console.log("The product selected is :" + productName);

      csv({
          noheader:true,
          trim:true,
          delimiter:';'
      })
      .fromFile(csvFilePath)
      .on('json',(jsonObj)=>{


          if (productName) {

            var matcher = new RegExp(productName,'i');
            var Productfound = matcher.test(jsonObj.field1);

//--------To know specific product latest version or service packs or patch level

            if (Productfound && typeofData) {
            productDesc = jsonObj.field2 + " " + jsonObj.field3;
          }

          else if (Productfound){
            productDesc = jsonObj.field4 + "\r\n" + jsonObj.field5;
          }
        }

          else{
            listOfProducts.push(jsonObj.field1);
          }


      })

      .on('done',(error)=>{


          if (productName) {
            console.log("The selected product is and productDesc is  :"+ productName + " " +productDesc);
            callback(close(sessionAttributes, 'Fulfilled',
                 {'contentType': 'PlainText', 'content': productDesc}));
          }

          else {

          console.log("List of Products: "+listOfProducts.join('\r\n'));
          callback(close(sessionAttributes, 'Fulfilled',
               {'contentType': 'PlainText', 'content': "Here is the list of our Enterprise Products:\r\n\r\n"+listOfProducts.join('\r\n')}));

             }

      })

    }

    // --------------- Events -----------------------

    function dispatch(intentRequest, callback) {



        console.log('request received for userId= ' + intentRequest.userId + ' intentName= ' +intentRequest.currentIntent.name);
        const sessionAttributes = intentRequest.sessionAttributes;
        const slots = intentRequest.currentIntent.slots;


        const whatInfo = slots.info;
        console.log('request received for Slots=' + JSON.stringify(whatInfo));


        if (intentRequest.currentIntent.name == "whatWeAreTalkingAbout") {

          console.log("Entering the talking about intent");

                if (/(webinar|events|webinars)/i.test(whatInfo)) {

                  var parser = require('rss-parser');
                  var webinar_Details = [];


                  parser.parseURL('https://www.axway.com/en/rss.xml', function(err, parsed) {

                    parsed.feed.entries.forEach(function(entry) {

                      if (entry.link.includes('\/webinar\/')) {
                         webinar_Details.push(entry.link);

                         console.log(webinar_Details);

                      }

                    });
                    callback(close(sessionAttributes, 'Fulfilled',
                         {'contentType': 'PlainText', 'content': "The upcoming Webinars are : \r\n"+ webinar_Details.join('\r\n')}));

                         console.log("webinar details: " + webinar_Details.join('\r\n'));
                  });

                }
                  //Get this data from your twitter apps dashboard
              else if (/(devstories|dev stories|blogs|blog|xyzdst0ry)/i.test(whatInfo)){
                var Twitter = require('twitter-js-client').Twitter;
                var info_dev_link = "Latest developer stories here: https://developer.appcelerator.com"

                    var config =
                    {
                        "consumerKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                        "consumerSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                        "accessToken": "xxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                        "accessTokenSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",

                    }

                      var success = function (data) {
                    callback(close(sessionAttributes, 'Fulfilled',
                         {'contentType': 'PlainText', 'content': JSON.parse(data)[0].text+"\r\n" +info_dev_link}));

                       }

                       var error = function (err, response, body) {
                           	console.log('ERROR [%s]', err);
                           };

                  var twitter = new Twitter(config);
                  twitter.getUserTimeline({ screen_name: 'AppcDev', count: '10'}, error, success);

                   }

                   else if (/(arrayOfcommands|help)/i.test(whatInfo)){

                     let help = "You can type:\r\n"

                     var commands =  ["1. Axway '<Product name>' To know about more details",
                                       "2. Documentation '<Product name>' ","3. Axway Free Trials or I want to try a product",
                                       "4. Axway list of products",
                                       "5. Search <query> to find an exisitng issue",
                                       "6. Latest service pack or patch for 'product name'",
                                       "7. Axway Events or webinars","8. Axway News",
                                       "9. Axway Help or just type 'I need help' to get this command list anytime",
                                       "10. Axway Careers."
                                     ]

                     callback(close(sessionAttributes, 'Fulfilled',
                          {'contentType': 'PlainText', 'content': help+commands.join('\r\n')}));

                   }

                   else if (/news/i.test(whatInfo)) {

                     let news = "https://www.axway.com/en/about-axway/newsroom";

                     var Twitter = require('twitter-js-client').Twitter;

                         var config =
                         {
                            "consumerKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                            "consumerSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                            "accessToken": "xxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                            "accessTokenSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",

                        }

                           var success = function (data) {
                         callback(close(sessionAttributes, 'Fulfilled',
                              {'contentType': 'PlainText', 'content': JSON.parse(data)[0].text + "\r\n\r\nFollow us here for more news: \r\n"+ news}));

                            }

                            var error = function (err, response, body) {
                                	console.log('ERROR [%s]', err);
                                };

                       var twitter = new Twitter(config);
                       twitter.getUserTimeline({ screen_name: 'axway', count: '10'}, error, success);

                   }

                   else if (/products/i.test(whatInfo)) {

                     products(intentRequest,callback);

                     //console.log("output from product function is : " + output);
                   }

                   else if (/(basicInfoCompany|about)/i.test(whatInfo)) {

                      var parsedInfo = require('./axway.json')
                      callback(close(sessionAttributes, 'Fulfilled',
                             {'contentType': 'PlainText', 'content': parsedInfo.axway}));


                   //console.log("output from product function is : " + output);
                   }

                   else if (/(freetrials|trials|trial|trial|use|try)/i.test(whatInfo)) {

                      var parsedInfo = require('./axway.json')
                      callback(close(sessionAttributes, 'Fulfilled',
                             {'contentType': 'PlainText', 'content': parsedInfo.FreeTrial}));
               //console.log("output from product function is : " + output);
                   }

                   else if (/amplify/i.test(whatInfo)) {

                     let pName = "amplify";

                      products(intentRequest,callback,pName);

                   //console.log("output from product function is : " + output);
                   }

                   else if (/(AllDocs|documentation|docs|PrdDocAllxyz)/i.test(whatInfo)) {

                      var parsedInfo = require('./axway.json')
                      callback(close(sessionAttributes, 'Fulfilled',
                             {'contentType': 'PlainText', 'content': parsedInfo.mainDocumentation}));
               //console.log("output from product function is : " + output);
                   }

                   else if (/(career|careers)/i.test(whatInfo)) {

                      var opportunities = "You can watch for cool opportunities here:\r\nhttps://www.axway.com/en/career";

                      callback(close(sessionAttributes, 'Fulfilled',
                             {'contentType': 'PlainText', 'content': opportunities}));
               //console.log("output from product function is : " + output);
                   }

                   else {
                     callback(close(sessionAttributes, 'Fulfilled',
                          {'contentType': 'PlainText', 'content': "Please Type 'I need help' to list the services I can provide.."}));
                          console.log("Slot info for debugging which could not get captured above: " + whatInfo);
                        }
                   }

//-------------------------------Product Intent--------------------------

                else if (intentRequest.currentIntent.name === "getProductList") {
                  console.log("Entering Product Intent with slot details as : " + slots.pName);
                  let pName = slots.pName;
                  if (/(b2bi|integrator|api management plus|cft|transfer cft|titanium|arrow|mbass|gateway interchange|amplify|syncplicity)/i.test(pName)) {
                    products(intentRequest,callback,pName);
                  }
                  else {
                    products(intentRequest,callback);
                  }


                }
//-------------------------------Product Version and Release Intent--------------------------

                else if (intentRequest.currentIntent.name === "ProductReleaseAndSP") {
                  let pName = slots.pName;
                  let typeofData = slots.typeofData;

                  if (/(docs|documentation|doc)/i.test(typeofData)) {

                    var file = require('./axway.json');

                    var arr = file.products;



                    var output = arr.filter(function(value){ console.log("pName is: "+pName + " value of product is: "+ value.product );
                                  return  pName.toUpperCase().includes(value.product.toUpperCase());
                    })

                    if (output.length) {

                      callback(close(sessionAttributes, 'Fulfilled',
                             {'contentType': 'PlainText', 'content': output[0].doc}));
                    }

                    else{

                      callback(close(sessionAttributes, 'Fulfilled',
                             {'contentType': 'PlainText', 'content': "http://doc.axway.com"}));
                    }
                    console.log("Documentation url is : " +output[0].doc);


                  }

                  else {
                  products(intentRequest,callback,pName,typeofData);
                }


                }

              };

    // --------------- Main handler -----------------------

    // Route the incoming request based on intent.
    // The JSON body of the request is provided in the event slot.
    exports.handler = (event, context, callback) => {
        try {
            dispatch(event,
                (response) => {
                    callback(null, response);
                });
        } catch (err) {
            callback(err);
        }
    };
