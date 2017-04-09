$(function(){
  var api_key = '?key=15e5e87284630078dd55e3d269744fd8';
  var root_url = 'http://api.reimaginebanking.com/';

  //Get account information
  chrome.storage.sync.get("nickname",function(data){
    $('#nickname').text($('#nickname').text() + data.nickname + ':');
  });

  chrome.storage.sync.get(["account_id","day_limit","min_balance"], function(data){
    $.getJSON(root_url + "accounts/" + data.account_id + api_key, function(account){
      if(account.balance <= data.min_balance){
        $('#currbal').css('color', 'red');
      }
      else{
        $('#currbal').css('color', 'black');
      }
      $('#currbal').text("$" + account.balance);
      setSchedOut(data.account_id, account.balance, data.day_limit, data.min_balance);
    });
  });

  function setSchedOut(account_id, balance, day_limit, min_bal){
    $.getJSON(root_url + "accounts/" + account_id + "/bills/" + api_key, function(bills){
      $('#schedout').css('color', 'red');

      bills = jQuery.grep(bills, function( item, index ) {
        return ( item.recurring_date > 0 || item.status == 'pending' );
      });

      var scheduled_out = 0;
      bills.forEach(function(item, index){
        var payment_date = new Date(getDateFromFormat(item.payment_date,'yyyy-mm-dd'));
        var curr_date = new Date();

        if((item.status == 'pending') || (item.status == 'recurring') && (day_limit - date_diff_indays(payment_date, curr_date) <= 0)){
          scheduled_out += item.payment_amount;
        }
      })

      $('#schedout').text("$" + scheduled_out);
      setSchedInAndAvail(account_id, balance, scheduled_out, day_limit);
    });
  }

  function setSchedInAndAvail(account_id, balance, scheduled_out, day_limit, min_bal){
    $.getJSON(root_url + "accounts/" + account_id + "/deposits/" + api_key, function(deposits){

      deposits = jQuery.grep(deposits, function( item, index ) {
        var transaction_date = new Date(getDateFromFormat(item.transaction_date,'yyyy-mm-dd'));
        var curr_date = new Date();
        return ((day_limit - date_diff_indays(transaction_date, curr_date) <= 0) || item.status == 'pending' );
      });

      var scheduled_in = 0;
      deposits.forEach(function(item, index){
        scheduled_in += item.amount;
      })

      $('#schedin').text("$" + scheduled_in);

      //var orderText = document.getElementById("subtotals-marketplace-spp-bottom").innerText;
      //var price = orderText.split('$');

      //console.log(price);

      chrome.tabs.getCurrent(function(tab) {
          alert(tab.title);
      });

      $('#thispurch').text("$" + "");

      var total = balance - scheduled_out + scheduled_in;

      if(total <= min_bal){
        $('#amntavailable').css('color', 'red');
      }
      else{
        $('#amntavailable').css('color', 'green');
      }

      $('#amntavailable').text("$" + total);

    });
  }

  $("#settingsbtn").click(function(event){
    event.preventDefault();
    chrome.runtime.openOptionsPage();
  });

});
