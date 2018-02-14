//BUDGET CONTROLLER
var budgetcontroller=(function(){
    var expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    //----------------------------------------------------------------------
    expense.prototype.calcpercentage= function(totalincome){
        if(totalincome > 0)
            {
                this.percentage = Math.round((this.value / totalincome) * 100);
            }
        else
            {
                this.percentage = -1;
            }
    };
    
    expense.prototype.getpercentage = function()
    {
        return this.percentage;  
    };
    
    //------------------------------------------------------------------------
    var income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    var calculatetotal = function(type){
        var sum=0;
        
        data.allitems[type].forEach(function(current){
            sum+= current.value;
        });
        data.totals[type] = sum;
    };
    
    var data={
        allitems:{
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1
    };   
    
    return {
        additem:function(type,des,val){
            var newitem,id;
            
            //Create new id
            if(data.allitems[type].length > 0)
                {
                    id= data.allitems[type][data.allitems[type].length - 1].id +1;        
                }
            else 
                {
                    id=0;
                }
            
            
            //create new item based on inc and exp
            if(type==='exp')
                {
                    var newitem=new expense(id,des,val);
                }
            else if(type==='inc')
                {
                    var newitem=new income(id,des,val);
                }
            
            //push it into our data structure
            data.allitems[type].push(newitem);
            
            //return the new data item
            return newitem;
        },
        
        deleteitem: function(type,id){
            var ids,index;
            
            ids = data.allitems[type].map(function(current){
                return current.id; 
            });
            
            //find the id
            index = ids.indexOf(id);
            
            //remove it from stucture
            if(index!== -1)
                {
                    data.allitems[type].splice(index , 1);
                }
                
        },
        
        calculatebudget:function(){
        
            //1. calculate total income and budget
                calculatetotal('exp');
                calculatetotal('inc');
        
            //2. calculate budget
                data.budget= data.totals.inc - data.totals.exp;
        
            //3. calculate per of income that 
                if(data.totals.inc > 0){
                    data.percentage = Math.round((data.totals.exp / data.totals.inc ) *100);
                }
                else{
                    data.percentage = -1;
                }
        },
        
        //-----------------------------------------------------------------------------
        calculatepercentages: function()
        {
            data.allitems.exp.forEach(function (current){
               current.calcpercentage(data.allitems.inc); 
            });
        },
        
        getpercentage: function(){
            var allprec = data.allitems.exp.map(function (current){
                return current.getpercentage();  
            });
            return allprec;
        },
        //----------------------------------------------------------------------------- 
        
        getbudget:function(){
            return {
                budget: data.budget,
                totalinc : data.totals.inc,
                totalexp : data.totals.exp,
                percentage : data.percentage
            }
        },
        testing:function()
        {
            console.log(data);
        }
    }
})();







//UI CONTROLLER
var uicontroller=(function(){
    
    var domstring = {
        inputtype:'.add__type',
        inputdescription:'.add__description',
        inputvalue:'.add__value',
        inputbtn:'.add__btn',
        expensecontainer:'.expenses__list',
        incomecontainer:'.income__list',
        budgetlabel: '.budget__value',
        totalinclabel: '.budget__income--value',
        totalexplabel: '.budget__expenses--value',
        percentage: '.budget__expenses--percentage',
        container: '.container',
        datelabel: '.budget__title--month'
    };
    var formatnumber = function(num , type)
        {
            var numsplit,int,dec;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numsplit = num.split('.');
            
            int = numsplit[0];
            if(int.length > 3)
                {
                    int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3 , 3);
                }
            dec = numsplit[1];
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
         
    return {
        getinput:function(){
            return {
                type:document.querySelector(domstring.inputtype).value,
                description:document.querySelector(domstring.inputdescription).value,
                value: parseFloat(document.querySelector(domstring.inputvalue ).value)
            };
        },
        
        addlistitem: function(obj,type){
            var html,newhtml,element;
            
        //create placeholder text with html tag
            if(type==='inc')
                {
                    element=domstring.incomecontainer;
                    html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
            else if(type==='exp')
                {
                    element=domstring.expensecontainer;
                    html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                }
        //replace placeholder with actual data
            newhtml=html.replace('%id%',obj.id);
            newhtml=newhtml.replace('%description%',obj.description);
            newhtml=newhtml.replace('%value%',formatnumber(obj.value , type));
    
        //insert html into dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);
        },
        
        deletelistitem: function(selectorid){
            
            var element = document.getElementById(selectorid);
            element.parentNode.removeChild(element);
        },
        
        clearfields:function(){
            document.querySelector(domstring.inputdescription).value="";
            document.querySelector(domstring.inputvalue).value="";
            document.querySelector(domstring.inputdescription).focus();
        },
        
        displaybudget: function(obj){ 
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(domstring.budgetlabel).textContent= formatnumber(obj.budget,type);
            document.querySelector(domstring.totalexplabel).textContent= formatnumber(obj.totalexp,'exp');
            document.querySelector(domstring.totalinclabel).textContent= formatnumber(obj.totalinc,'inc');
            
            if(obj.percentage > 0 )
                {
                    document.querySelector(domstring.percentage).textContent= obj.percentage + '%';
                }
            else
                {
                    document.querySelector(domstring.percentage).textContent= '---';
                }
        },
        
        displayyear: function(){
            var now,year,month,months;
            
            months = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May' , 'Jun' , 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domstring.datelabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedtype: function(){
            
            document.querySelector(domstring.inputtype).classList.toggle('red-focus');
            document.querySelector(domstring.inputdescription).classList.toggle('red-focus');
            document.querySelector(domstring.inputvalue).classList.toggle('red-focus');
            document.querySelector(domstring.inputbtn).classList.toggle('red-focus');
        },
        
        getdomstring:function(){
            return domstring;
        } 
    };
})();









//GLOBAL APP CONTROLLER
var controller=(function(budgetctrl,uictrl){
    
    var setupeventlistener=function(){
        var dom =uictrl.getdomstring();    
        document.querySelector(dom.inputbtn).addEventListener('click',ctrladditem);
        
        document.querySelector(dom.inputtype).addEventListener('change',uictrl.changedtype);
        
        document.addEventListener('keypress',function(event){
        
        if(event.keyCode===13)
            {
                ctrladditem();
            }
        
        }); 
        
        document.querySelector(dom.container).addEventListener('click',ctrldeleteitem);
    };
    
    var updatebudget=function(){
        //1. calculate the budget
            budgetctrl.calculatebudget();
        
        //2. retur nthe budget
            var budget=budgetctrl.getbudget();
        
        //3. display the budget on the ui
           uictrl.displaybudget(budget);
    };
    
    //-----------------------------------------------------------------------------
    var calculatepercentage= function()
    {
        //1. calculate percentages
            budgetctrl.calculatepercentages();
        
        //2. read percentages from budget controller
            var percentages = budgetctrl.getpercentage();    
        
        //3. update ui with new percentages
            //console.log(percentages);
        
    };
    //-----------------------------------------------------------------------------
    
    var ctrladditem=function(){
            var input,newitem;
        
        //1. Get the input field data
            input=uictrl.getinput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value>0)
        {
        //2. add the item to the budget controller
            newitem= budgetctrl.additem(input.type,input.description,input.value);
        
        //3. add the item to the ui
            uictrl.addlistitem(newitem,input.type);
        
        //4. clear the fields
           uictrl.clearfields(); 
        
        //5. calculate and update budget
            updatebudget();
            
        //6. calculate percentages
            calculatepercentage();
        }
        else{console.log('enter some value');}
    };
    
    var ctrldeleteitem= function(event){
        
        var itemid,splitid,type,id;
        
        itemid=event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemid)
            {
                splitid= itemid.split('-');
                type= splitid[0];
                id=parseInt(splitid[1]);
                
                //1. delete the item from  data structure
                    budgetcontroller.deleteitem(type , id);
                
                //2. delete the item from ui
                    uictrl.deletelistitem(itemid);
                
                //3. update and show the new budget
                    updatebudget();
                
                //6. calculate percentages
                    calculatepercentage();
            }
    };

    return {
         init: function(){
            console.log('app has started');
             uictrl.displayyear();
             uictrl.displaybudget({
                budget: 0,
                totalinc : 0,
                totalexp : 0,
                percentage : -1}
                );
            setupeventlistener();
         }
    }
    
})(budgetcontroller,uicontroller);

controller.init();