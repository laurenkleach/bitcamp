 //var id = "58e93df3a73e4942cdafd397";
 var id = "58e93df3a73e4942cdafd395";
 var hashy = [];
 var minBalanceVar =0;
 function main() {
     //Back end pieces
     //var id = "58e93df3a73e4942cdafd397";
     var balance;
     var id = "58e93df3a73e4942cdafd395";
     var key = "key=15e5e87284630078dd55e3d269744fd8";
     var url = "http://api.reimaginebanking.com/"; //use latah playa
     var accountURL = "http://api.reimaginebanking.com/accounts/" + id;
     var recurringBills = [];
     var pendingBills = [];
     //var accountURL = "http://api.reimaginebanking.com/accounts/" + id + "?key=15e5e87284630078dd55e3d269744fd8";
     var billsURL = "http://api.reimaginebanking.com/accounts/" + id + "/bills";
     var depositsURL = "http://api.reimaginebanking.com/deposits/" + id;
     var minimumBalance;

     var deposits = [];
     var day_limit = 64;
     var today = new Date();
     var billSum = 0,
         depositSum = 0;
     var allTransactions = [];
     var diff_in_days;
     var pendingTransactions = [];
     var runningBalanceVar;
     //var minBalanceVar;

     var syncstuff = chrome.storage.sync.get("min_balance", function(data) {
        minimumBalance = data.min_balance;
        return data.min_balance;
     });

     syncstuff.complete(function() {
        minimumBalance = data.min_balance;
     });

     var date_diff_indays = function(date1, date2) { //http://www.w3resource.com/javascript-exercises/javascript-date-exercise-8.php
         dt1 = new Date(date1);
         dt2 = new Date(date2);
         return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
     }

     var jqxhr = $.getJSON(accountURL, key, function(data) {
         console.log(data);
         console.log(data.balance);
         balance = data.balance;
     });

     jqxhr.complete(function() {
         console.log("second complete");
         console.log("balance: " + balance);
     });

     var jqxhrBills = $.getJSON(billsURL, key, function(data) {

         recurringBills = $.grep(data, function(n, i) {
             return n.status == "recurring" && date_diff_indays(today, n['creation_date']) <= day_limit;
         });
         addRecur(recurringBills);

         pendingBills = $.grep(data, function(n, i) {
             console.log(date_diff_indays(today, n['payment_date']));
             return n.status == "pending" && date_diff_indays(today, n['payment_date']) > 0 && date_diff_indays(today, n['payment_date']) <= day_limit;
         });
         pendingBillsAux(pendingBills);
         sortByDate(pendingTransactions);
         print("fml", pendingTransactions);
         runningBalance(pendingTransactions);
     });

     jqxhrBills.complete(function() {
         print("pendingTransactions", pendingTransactions);
         console.log("pendingTransactions.length: ", pendingTransactions.length)
         print("recurringBills", recurringBills);
         print("pendingBills", pendingBills);
         console.log("sum of pending bills: " + billSum);
     });


     function underMinValue(amazonPrice) {
         if (minBalanceVar - amazonPrice < minimumBalance) {
             return true;
         } else {
             return false;
         }
     }


     function pendingBillsAux(data) {
         $.each(data, function(key, val) {
             newBill = new Transaction(val.payment_date, val.payment_amount, true);
             pendingTransactions.push(newBill);
             //billSum += val.payment_amount;
         });
     }

     function pendingDepositsAux(data) {
         $.each(data, function(key, val) {
             newDeposit = new Transaction(val.payment_date, val.payment_amount, false);
             pendingTransactions.push(newDeposit);
             //depositSum += val.payment_amount;
         });
     }

     function sortByDate(data) {
         data.sort(function(a, b) {
             return new Date(a.date).getTime() - new Date(b.date).getTime()
         });
     }

     function runningBalance(data) {
         runningBalanceVar = balance;
         minBalanceVar = balance;
         //var dateHash = [];
         var hash = [];
         //var hash = [];
         $.each(data, function(key, val) {
             runningBalanceVar = val.isBill ? runningBalanceVar - val.amount : runningBalanceVar + val.amount;
             minBalanceVar = runningBalanceVar < minBalanceVar ? runningBalanceVar : minBalanceVar;
             hash[val.date] = runningBalanceVar;
             hashy[val.date] = runningBalanceVar;
             /*
                         var currBalance = hash.includes(val.date) ? hash[val.date] : 0;

                         if (hash.includes(val.date)) {
                             var currBalance = hash[val.date];

                             hash[val.date] = val.isBill ? currBalance - val.amount :  currBalance + val.amount;
                         }*/
         });
         console.log("minBalanceVar: " + minBalanceVar);


     }

     function Transaction(date, amount, isBill) {
         this.date = date;
         this.amount = amount;
         this.isBill = isBill;
     }

     /*     function Balance(date, balance) {
              this.date = date;
              this.balance = balance;
          }*/


     function addRecur(data) {

         $.each(data, function(key, val) {
             var creationDate = new Date(val.creation_date);
             var recurringDate = val.recurring_date;
             var creationDay = creationDate.getDate() + 1;
             var nextDate = new Date();
             var amount = val.payment_amount;

             console.log("nextDATE: ", nextDate);
             console.log("recurringDate: ", recurringDate);
             if (nextDate.getDate() > recurringDate) {
                 nextDate.setMonth(nextDate.getMonth() + 1);
                 console.log("nextDATE now: ", nextDate);
             }

             nextDate.setDate(recurringDate);
             var nextDateString, month, date;

             while (date_diff_indays(today, nextDate) < day_limit) {
                 month = nextDate.getMonth();
                 date = nextDate.getDate();
                 month = month < 10 ? "0" + month : month;
                 date = date < 10 ? "0" + date : date;
                 nextDateString = nextDate.getFullYear() + "-" + month + "-" + date;
                 newBill = new Transaction(nextDateString, amount, true);
                 pendingTransactions.push(newBill);
                 nextDate.setMonth(nextDate.getMonth() + 1);
             }
         });
     }

     function print(strcon, data) {
         console.log(strcon);
         if (data != undefined) {
             for (var i = 0; i < data.length; i++) {
                 str = JSON.stringify(data[i]);
                 console.log(str);
             }
         }
     }

     //console.log(date_diff_indays('04/02/2014', '11/04/2014'));
     console.log(date_diff_indays('2014-04-02', '2014-04-03'));

     var jqxhrDeposits = $.getJSON(depositsURL, key, function(data) {
         deposits = $.grep(data, function(n, i) {
             return n.status == "pending" && date_diff_indays(today, n['payment_date']) > 0 && date_diff_indays(today, n['payment_date']) <= day_limit;
         });
         pendingDepositsAux(deposits);
         sortByDate(pendingTransactions);

         print("fml", pendingTransactions);
         runningBalance(pendingTransactions);



     });

     jqxhrDeposits.complete(function() {
         console.log("second complete deposits");
         console.log("deposits: " + deposits);
         console.log("sum of pending deposits: " + depositSum);
     });
 }

 function getMin() {
   return minBalanceVar;
 }
