// Budget Controller
var Model = (function() {
  // Income Constructor
  var Income = function(id, description, value) {
    (this.id = id), (this.description = description), (this.value = value);
  };

  // Expense Constructor
  var Expense = function(id, description, value) {
    (this.id = id), (this.description = description), (this.value = value);
    this.percentage = -1;
  };

  Expense.prototype.calcPercentages = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPerc = function() {
    return this.percentage;
  };

  var calculateTotal = function(type) {
    sum = 0;

    data.allItems[type].forEach(el => {
      sum = sum + el.value;
    });

    data.totals[type] = sum;
  };

  // All the Data
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addedItem: function(type, des, val) {
      var newItem, ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new Item
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //Push the  newItem into the data structure
      data.allItems[type].push(newItem);

      // Return the new Element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      // Put the ids of the current list in an array because id != index (items can be deleted)
      ids = data.allItems[type].map(current => {
        return current.id;
      });

      index = ids.indexOf(id);

      // if the array is not empty
      if (index !== -1) {
        // delete the item with the specified index
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculate total income-expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of spent income
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(el => {
        el.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(el => {
        return el.getPerc();
      });

      return allPercentages;
    }
  };
})();

// UI Controller

var UICtrl = (function() {
  //  2019.25   =>  + 2,019.25 
  var formatNumber = function(num, type) {
    var numSplit, int, decimal, type;

    num = Math.abs(num);
    num = num.toFixed(2); // 2 => 2.00
    numSplit = num.split(".");
    int = numSplit[0];
    decimal = numSplit[1];

    //substr() returns a portion of the string, starting at the specified index and extending for a given number of characters afterward.
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }

    return (type === "exp" ? "-" : "+") + " " + int + "." + decimal + " &#8381";
  };

  // querySelectorAll forEach 
  var nodeListForEach = function(nodeList, callback) {
    for (let i = 0; i < nodeList.length; i++) {
      callback(nodeList[i], i);
    }
  };

  return {
    // Return the Input
    getInput: function() {
      return {
        type: document.querySelector(".add__type").value, // return inc OR exp
        description: document.querySelector(".add__description").value,
        value: parseFloat(document.querySelector(".add__value").value)
      };
    },

    // Change the html
    addListItem: function(obj, type) {
      var html, list;

      if (type === "inc") {
        list = document.querySelector(".income__list");

        html = `<div class="item clearfix" id="inc-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
        <div class="item__value">${formatNumber(obj.value, type)}</div>
        <div class="item__delete">
        <button class="item__delete--btn">
        <i class="ion-ios-close-outline"></i>
        </button>
        </div>
        </div>
        </div>`;
      } else if (type === "exp") {
        list = document.querySelector(".expenses__list");

        html = `<div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
        <div class="item__value">${formatNumber(obj.value, type)}</div>
        <div class="item__percentage">21%</div>
        <div class="item__delete">
        <button class="item__delete--btn">
        <i class="ion-ios-close-outline"></i>
        </button>
        </div>
        </div>
        </div>`;
      }

      // Insert the html into the list .
      list.insertAdjacentHTML("beforeend", html); // "beforeend": the inserted element is the last child of the list
    },

    clearFlields: function() {
      var fieldsList, fieldsArr;
      // querySelectorAll doesn't return an Array but instead a List
      fieldsList = document.querySelectorAll(".add__description, .add__value");

      // Converting the fieldsList to an Array by calling the slice method directly from the Array prototype
      fieldsArr = Array.prototype.slice.call(fieldsList);

      // Clearing all the fields
      fieldsArr.forEach(input => {
        input.value = "";
      });

      // focus back to the first field
      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      document.querySelector(".budget__value").textContent = obj.budget;
      document.querySelector(".budget__income--value").textContent =
        obj.totalInc;
      document.querySelector(".budget__expenses--value").textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(".budget__expenses--percentage").textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(".budget__expenses--percentage").textContent =
          "--";
      }
    },

    displayPercentages: function(percentages) {
      var list = document.querySelectorAll(".item__percentage");

      // foreach querySelectorALL
      nodeListForEach(list, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "--";
        }
      });
    },

    removeItem: function(IDSelector) {
      document.getElementById(IDSelector).remove();
    },

    formatNumber: function(num, type) {
      var numSplit, int, decimal, type;

      num = Math.abs(num);
      num = num.toFixed(2); // 2 => 2.00
      numSplit = num.split(".");
      int = numSplit[0];
      decimal = numSplit[1];

      //substr() returns a portion of the string, starting at the specified index and extending for a given number of characters afterward.
      if (int.length > 3) {
        int =
          int.substr(0, int.length - 3) +
          "," +
          int.substr(int.length - 3, int.length);
      }

      return (type === "exp" ? "-" : "+") + " " + int + decimal;
    },

    displayDate: function() {
      var today, months, month, year;

      today = new Date();
      year = today.getFullYear();
      month = today.getMonth();
      months= ["January","February","March","April","May","June","July",
      "August","September","October","November","December"];      document.querySelector(".budget__title--month").textContent = months[month] + " " + year;
    },

    changeType: function(){
      var fields;
      
      fields = document.querySelectorAll(".add__type, .add__description, .add__value");

      nodeListForEach(fields, (current) =>{
        current.classList.toggle('red-focus');
      });

      document.querySelector('.add__btn').classList.toggle('red');

      
    }
  };
})();

// Global App Controller
var Controller = (function(UI, budgetCtrl) {
  var setupEventListeners = function() {
    // press Add-Button
    document.querySelector(".add__btn").addEventListener("click", addItem);

    // press enter
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13) {
        addItem();
      }
    });

    // Delete Items
    document.querySelector(".container").addEventListener("click", ctrlDeleteItem);

    // change the color according to the type of input
    document.querySelector('.add__type').addEventListener('change', UI.changeType);
  };

  var updateBudget = function() {
    // 1- Calculate the budget
    budgetCtrl.calculateBudget();

    // 2- Return the budget
    var budget = budgetCtrl.getBudget();

    // 3-Display the budget
    UI.displayBudget(budget);
  };

  var updatePercentage = function() {
    // 1- Calculate the percentages
    budgetCtrl.calculatePercentages();

    // 2- Add the percentages to the Controller
    var percentages = budgetCtrl.getPercentages();

    // 3- Update the UI
    UI.displayPercentages(percentages);
  };

  var addItem = function() {
    var input, newItem;

    // 1 -Get the filled input Data
    input = UI.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2- Add the Item to the budget Controller
      newItem = budgetCtrl.addedItem(
        input.type,
        input.description,
        input.value
      );

      // 3- Add the newItem to the UI
      UI.addListItem(newItem, input.type);

      // 4- Clear the input fields
      UI.clearFlields();

      // 5- Calculate the budget
      updateBudget();

      // 6-
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, id, type;

    // target  the item by clicking the delete icon
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);

      // 1-Delete the item from the Data Structure
      budgetCtrl.deleteItem(type, id);

      // 2-Delete the item from the UI
      UI.removeItem(itemID);

      // 3-Update the Budget
      updateBudget();

      // 4-
      updatePercentage();
    }
  };

  return {
    // Initialisation
    init: function() {
      setupEventListeners();
      UI.displayDate();
      UI.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(UICtrl, Model);

Controller.init();
