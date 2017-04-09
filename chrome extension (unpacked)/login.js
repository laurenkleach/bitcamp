/**
 * Created by thinguyen on 4/8/17.
 */
// Assign handlers immediately after making the request,
// and remember the jqxhr object for this request
$(document).ready(function() {
  $("#fundsButton").click(function() {
    $("<p>ayoy</p>").appendTo("body");

  });
    // Validate cusID after login
    $("#login").click(function (e) {
        e.preventDefault();
        //$("#login").disable();
        var cusId = $("#cusID").val();
        console.log($("#cusID").val());
        var urlToGetCusInfo = "http://api.reimaginebanking.com/customers/" + cusId +  "?key=15e5e87284630078dd55e3d269744fd8";

        var getCusInfo = $.getJSON(urlToGetCusInfo,
            function(data) {

                console.log( "success" );
                $("<p>Customer Information:</p>").appendTo( "#cusInfo" );
                $.each( data, function( key, val ) {
                    $( "<p>" + key + " : " + val + "</p>" ).appendTo( "#cusInfo" );
                });
            })
            .done(function() {
                //alert("Value: " + $("#cusID").val());
                console.log( "second success" );
            })
            .fail(function() {
                console.log( "error" );
            })
            .always(function() {
                console.log( "complete" );
            });

            // If cusID is valid, show their account ids
            getCusInfo.complete(function() {
                var urlToGetCusAccount = "http://api.reimaginebanking.com/customers/" + cusId + "/accounts?key=15e5e87284630078dd55e3d269744fd8";
                var getCusAccount = $.getJSON(urlToGetCusAccount,
                    function(data) {
                        var prop,accountNo;

                        console.log( "success" );

                        if (data.length == 0 ) {
                            $( "<p>You don't have an account available now. Would you like to create one?</p>" ).appendTo( "#cusAccounts" );
                        }
                        else {
                          var accountHTML = "<p>Please choose an account:</p>";
                          for (var i = 0; i < data.length; i++){
                            var account = data[i];
                            var accountId = account._id;
                            var nickname = account.nickname;
                            var accountType = account.type;

                            accountHTML += '<input type="radio" name="account_id" value=' + accountId + '>';
                            accountHTML += "<p>Nickname: " + nickname + "</p>";
                            accountHTML += "<p>Account Type: " + accountType + "</p>";

                               /*for (prop in data[i]){
                                    $( "<p>" + prop + " : " + data[i][prop] + "</p>" ).appendTo( "#cusAccounts" );
                               }*/
                          }
                          $("#cusAccounts").html(accountHTML);
                        }

                    })


                    //After showing all accounts, ask customers to choose an account
                    getCusAccount.complete(function() {
                        $('<span>What is the minimum balance that you would like to maintain: $</span>').appendTo("#setUpAccount");
                        $('<input type="number" id="min_balance" min="0" step="10" value="200"><br/>').appendTo("#setUpAccount");


                        $('<span>How long would you like to maintain this balance?</span>').appendTo("#setUpAccount");
                        $('<input type="number" id="day_limit" min="0" step="10" value="30">').appendTo("#setUpAccount");
                        $('<span> days</span><br/>').appendTo("#setUpAccount");
                        $('<span><button id="submitSetUpAccount" type="button" class="btn btn-success btn-sm">Submit</button><p id="successmessage" style="display:none">Settings saved!</p><span>').appendTo("#setUpAccount");

                        $("#submitSetUpAccount").click(function (e) {
                            //e.preventDefault();
                            var selectedAccount = $("input[name='account_id']:checked");
                            var input = selectedAccount.val();
                            var splitinput = input.split(',');
                            account_id = splitinput[0];
                            console.log(account_id);
                            chrome.storage.sync.set({"account_id":account_id});

                            nickname = splitinput[1] + " Account";
                            chrome.storage.sync.set({"nickname":nickname});

                            console.log("You choose " + account_id);
                            console.log("You choose " + nickname);
                            $('#successmessage').css('color','green');
                            $('#successmessage').show();

                            var min_balance = $("#min_balance").val();
                            chrome.storage.sync.set({"min_balance":min_balance});
                            console.log(min_balance);
                            var day_limit = $("#day_limit").val();
                            chrome.storage.sync.set({"day_limit":day_limit});
                            console.log(day_limit);
                            var input, account_id, nickname ;
                        });
                        /*$("input[type='radio']").click(function(e){
                            input = $("input[name='account_id']:checked").val();
                            if(input){
                                // for ( var i = 0; i < input.length;i++){
                                //    console.log(input[i]);
                                // }
                                var splitinput = input.split(',');
                                account_id = splitinput[0];
                                console.log(account_id);
                                chrome.storage.sync.set({"account_id":account_id});

                                nickname = splitinput[1] + " Account";
                                chrome.storage.sync.set({"nickname":nickname});

                                console.log("You choose " + account_id);
                                console.log("You choose " + nickname);
                                $('#successmessage').css('color','green');
                                $('#successmessage').show();
                            }
                            else {
                                alert("Please choose account_id");
                            }

                        });*/

                    });
            });
    })
});
