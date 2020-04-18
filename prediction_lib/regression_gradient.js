let path = require('path');

let math_js = require("mathjs");

let filereader = require(path.resolve(__dirname, "./FileReader.js" ))
let match_data = filereader.match_data;


function train_with_gradient_desendt(X, Y){
    let alpha = 0.01; // Learning rate

    let [rows, columns] = X.size();

    let weights = [[]];
    for(let i = 0; i < columns; i++){
        weights[0].push(1);
    }

    weights = math_js.matrix(weights);
    weights = math_js.transpose(weights);

    for(let i = 0; i < rows; i++){
        weights = update_weights(math_js.row(X, i), math_js.row(Y, i), weights, alpha);
    }

    return weights;
}

function update_weights(features, label, weights, alpha){
    let [rows, columns] = features.size();

    label = math_js.matrix([[label]]);
    label = math_js.transpose(label);

    let prediction = predict(features, weights);

    let gradient = cost_with_respect_to_weight(features, prediction, label);

    let average_cost = math_js.divide(gradient, columns);

    let weights_learning_rate = math_js.multiply(average_cost, alpha);

    let updated_weights = math_js.subtract(weights, weights_learning_rate);

    return updated_weights;
}

function predict(X, cofficients){
    let value = math_js.multiply(X, cofficients);
    
    return sigmoid(value);
}

function sigmoid(x){
    x = x.subset(math_js.index(0,0));

    let e_to_power_of_x = Math.pow(Math.E, -x);

    return 1 / (1 + e_to_power_of_x);
}

function dicision_bound(x){
    return (x >= 0.5) ? 1 : 0;
}

/*
function cost_function(actual_value, predicted_value, number_independt){
    return 1/number_independt * (actual_value * Math.log(predicted_value) + (1 - actual_value)) * Math.log(1 - predicted_value);
} */

function cost_with_respect_to_weight(X, predicted_value, actual_value){
    actual_value = actual_value.subset(math_js.index(0,0));
    let cost_matrix = math_js.matrix([[predicted_value - actual_value]])

    return math_js.multiply(math_js.transpose(X), cost_matrix);
}

let data = new match_data("actual_data")
let [all, test] = data.filter_all_files();

all = math_js.matrix(all)

let prediction = math_js.column(all, 0);
all = math_js.transpose(all).toArray()
all.shift();

let independt = math_js.transpose(math_js.matrix(all))

let weights = train_with_gradient_desendt(independt, prediction);





function calculate_yi(coeficcients, point){
    let value = math_js.multiply(point, coeficcients);
    return sigmoid(value);
}

let count = 0;
test = math_js.matrix(test);
let test_prediction = math_js.column(test, 0);
test = math_js.transpose(test).toArray();
test.shift();

let [rows, columsn] = test_prediction.size();
let test_independt = math_js.transpose(math_js.matrix(test));
for (let i=0; i < rows; i++){
    let our_pred = calculate_yi(weights, math_js.row(test_independt, i));
    our_pred = dicision_bound(our_pred);
    //let delta = test_prediction.subset(math_js.index(i, 0)) - our_pred**2;

    console.log("predicted outcome is ", our_pred, " actual was", test_prediction.subset(math_js.index(i, 0)), "correct? ", test_prediction.subset(math_js.index(i, 0)) == our_pred)
    if (test_prediction.subset(math_js.index(i, 0)) == our_pred){
        count++;
    }
    //console.log("our", our_pred)
    //console.log("actual", prediction.subset(math_js.index(i, 0)))
    //console.log("delta", delta)
    //sum += delta;
}
console.log("rows ",rows, " count", count)


