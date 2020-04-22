let path = require('path');

let math_js = require("mathjs");

let filereader = require(path.resolve(__dirname, "./FileReader.js" ))
let match_data = filereader.match_data;


function train_with_gradient_desendt(X, Y){
    let d = new Date();
    let alpha = 0.0000005; // Learning rate

    let [rows, columns] = X.size();

    // 64%
    let weights = [
        [ -0.018191192252672964 ],
        [ 90.54854240039542 ],
        [ 243.78931329059097 ],
        [ 74.95282991702884 ],
        [ -0.48810319481207176 ],
        [ -14.3519774747087 ],
        [ 31.622603083262373 ],
        [ -0.0031397648144619456 ],
        [ -59.150697292834295 ],
        [ -229.75549692391462 ],
        [ -34.95317958653955 ],
        [ 0.4122897690537062 ],
        [ 1.9927489628545805 ],
        [ -56.519142455551105 ],
        [ -12.19219263623585 ],
        [ 6.801765919353453 ],
        [ 129.40358394148942 ],
        [ 99.63214806028763 ],
        [ 61.825978488842054 ],
        [ 154.32320119814375 ]
    ]; 

    // 
    /*
    let weights = [
        [ -1.2561337931015775 ], [ 101.20589064778639 ],
        [ 275.5526203991468 ],   [ 83.59601180559385 ],
        [ 1.3957297371767132 ],  [ -74.01232749109597 ],
        [ 30.41063305206861 ],   [ 6.036096817680928 ],
        [ -66.1576318350284 ],   [ -258.9130842382036 ],
        [ -39.5774168888598 ],   [ -0.8159184470478396 ],
        [ 64.30033728478175 ],   [ -57.99429909219574 ],
        [ -14.122366173877552 ], [ 8.865619768582603 ],
        [ 147.20094443242667 ],  [ 113.20941642182252 ],
        [ 70.48759531632136 ],   [ 175.79416057492782 ]
      ];
    */

    weights = math_js.matrix(weights);
    //weights = math_js.transpose(weights);

    let Cost = Array();
    let costs;
    //let beta = -11.056794823625168;
    let beta = -12.614974864491238;

    /*for(let i = 0; i < 25000; i++){
        //[weights, beta] = update_weights(alpha, beta, weights, math_js.row(Y, i), math_js.row(X, i));
        [weights, beta, costs] = update_weights(alpha, beta, weights, Y, X);
        if(i % 25 == 0){
            //console.log("This is the beta: ", beta);
            //console.log(weights);
            console.log("Iteration: ", i);
            console.log("This is costs:", costs);
        }
    } */
    let j = 0;
    n = d.getTime() + 1000;
    let b;
    let delta_X;
    let delta_y;
    while(j % 50 != 1 || (b.getTime() < n)){
        [delta_X, delta_Y] = random_data_size(X, Y);
        [weights, beta, costs] = update_weights(alpha, beta, weights, delta_Y, delta_X);
        if(j % 50 == 0){
            console.log("This is the beta: ", beta);
            console.log(weights);
            console.log("Iteration: ", j);
            //console.log("This is costs:", costs);
            b = new Date();
        }
        j++;
    }

    //weights = update_weights(math_js.row(X, i), math_js.row(Y, i), weights, alpha);
    /* for(let i = 0; i < 500; i++){
        //console.log(weights);
        [weights, beta] = update_weights(alpha, beta, weights, Y, X);
        //console.log(weights);
        if(i % 25 == 0){
            console.log(weights);
            console.log("Iteration: ", i);
        }
    } */

    return [weights, beta];
}

function random_data_size(features, labels){
    let [rows, columns] = features.size();

    let delta_rows = 0;
    while(delta_rows < 10){
        delta_rows = Math.floor(Math.random() * rows);
    }


    let features_array = features.toArray();
    let labels_array = labels.toArray();
    let selected_features = Array(delta_rows);
    let selected_labels = Array(delta_rows);
    let random_row = 0;

    for(let i = 0; i < delta_rows; i++){
        random_row = Math.floor(Math.random() * rows);
        selected_features[i] = features_array[random_row];
        selected_labels[i] = labels_array[random_row];
    }

    return [math_js.matrix(selected_features), math_js.matrix(selected_labels)];
}

function cost(feature, labels, predictions){
    let [rows, columns] = labels.size();

    predictions = predictions.toArray();
    labels = labels.toArray();
    let sum = 0;
    for(let i = 0; i < rows; i++){
        sum = sum + (labels[i][0] == 1) ? -1 * Math.log10(((predictions[i][0] === 0) ? 0.00001 : predictions[i][0])) : -1 * Math.log10(1 - ((predictions[i][0] == 1) ? 0.999999 : predictions[i][0]));
        //predictions_1.push(((predictions[i][0] == 1) ? 0 : Math.log10(1 - predictions[i][0])));
        //predictions[i][0] = (Math.log10(predictions[i][0]));

        //labbels_1.push((labels[i][0] == 1) ? -1 : 0);
        //labels[i][0] = -1 * (labels[i][0]);

        //one.push(1);
    }   
    //console.log("This is right side:", right_side);
    //console.log("This is left side:", left_side);

    return sum/rows;
}

function update_weights(alpha, beta, weights, label, feature){
    let [rows, columns] = feature.size();


    //console.log(weights);
    //console.log("This is weights:", weights);
    //console.log("This is beta:", beta);

    //console.log("I'm running fine");
    //console.log("This is fea", feature);
    let prediction = math_js.multiply(feature, weights);

    //console.log("I'm running fine");
    //console.log("This is the prediction:", prediction);
    
    prediction = prediction.toArray();
    for(let i = 0; i < rows; i++){
        prediction[i][0]= prediction[i][0] + beta;
        prediction[i][0] = sigmoid(prediction[i][0]);
    }

    prediction = math_js.matrix(prediction);
    //prediction = math_js.transpose(prediction);

    let costs  = cost(feature,label, prediction);

    //console.log("This is ther prediction:", prediction)

    //console.log("I'm running fine");
    let sum_b0 =  sum_pred(prediction, label, 0);
    //console.log("beta - alpha...:", beta, alpha, (2/rows), sum_b0);
    let new_beta = beta - alpha * (2/rows) * sum_b0;
    //console.log("This is new beta:", new_beta);
    /*
    let epsilon = alpha*(2/rows);

    let weight_sum = sum_pred(prediction, label, feature);
    let [ind_row, ind_column] = weight_sum.size();
    weight_sum = weight_sum.toArray();
    for(let i = 0; i < ind_row; i++){
        weight_sum[0][i] = weight_sum[0][i] * epsilon;
    }

    weight_sum = math_js.matrix(weight_sum);
    weight_sum = math_js.transpose(weight_sum);

    //console.log("I'm running fine");
    //console.log("This is the equation:", weights, "-", weight_sum);
    let average = math_js.subtract(weights, weight_sum);
    //console.log("This is the result:", average);

    //console.log("I'm running fine");
    let updated_weights = math_js.subtract(weights, average);
    */
    //console.log("This is the updated weights:", updated_weights);
    let gradient = math_js.multiply(math_js.transpose(feature), math_js.subtract(prediction, label));
    //console.log("This is the gradient", gradient);
    gradient = math_js.multiply(gradient, alpha);
    //console.log("This is gradient timed alpha", gradient);
    gradient = math_js.divide(gradient, rows);
    //console.log("This is divided by rows", gradient);
    average = math_js.subtract(weights, gradient);

    return [average, new_beta, costs];
}

function sum_pred(prediction, label, feature){
    let [rows, columns] = prediction.size();
    if(feature == 0){
        let sum = 0;
        let delta = math_js.subtract(label, prediction);
        for(let i = 0; i < rows; i++){
            sum += math_js.subset(delta, math_js.index(i, 0));
        }
        return sum;
    } else {
        let sum_matrix = math_js.row(feature, 0);
        for(let i = 0; i < rows; i++){
            sum_matrix = math_js.add(sum_matrix, math_js.multiply(math_js.row(feature, i), math_js.subtract(math_js.row(label, i), math_js.row(prediction, i))));
        }  
        return math_js.subtract(sum_matrix, math_js.row(feature, 0));
    }    
}

function sigmoid(x){
    let e_to_power_of_x = Math.pow(Math.E, -x);

    return 1 / (1 + e_to_power_of_x);
}

function dicision_bound(x){
    x = (x < 0) ? -x : x;
    return (x >= 0.5) ? 1 : 0;
}

function predict(X, cofficients){
    let value = math_js.multiply(X, cofficients);

    let [rows, columns] = value.size();
;
    value = value.toArray();

    for(let i = 0; i < rows; i++){
        value[i][0] = sigmoid(value[i][0])
    }

    value = math_js.matrix(value);

    return math_js.transpose(value);
}

let data = new match_data("actual_data")
let [all, test] = data.filter_all_files();

all = math_js.matrix(all)

let prediction = math_js.column(all, 0);
all = math_js.transpose(all).toArray()
all.shift();

let independt = math_js.transpose(math_js.matrix(all))

let [weights, beta] = (train_with_gradient_desendt(independt, prediction));



function calculate_yi(coeficcients, point, beta){
    let value = math_js.multiply(point, coeficcients);
    value = math_js.subset(value, math_js.index(0,0));
    return sigmoid(value + beta);
}

let count = 0;
test = math_js.matrix(test);
let test_prediction = math_js.column(test, 0);
test = math_js.transpose(test).toArray();
test.shift();

let [rows, columns] = test_prediction.size();
let test_independt = math_js.transpose(math_js.matrix(test));
for (let i=0; i < rows; i++){
    let our_pred = calculate_yi(weights, math_js.row(test_independt, i), beta);
    let _our_pred = dicision_bound(our_pred);
    //let delta = test_prediction.subset(math_js.index(i, 0)) - our_pred**2;

    console.log("predicted outcome is ", _our_pred, " actual was", test_prediction.subset(math_js.index(i, 0)), "correct? ", test_prediction.subset(math_js.index(i, 0)) == _our_pred, "This is prediction:", our_pred);
    if (test_prediction.subset(math_js.index(i, 0)) == _our_pred){
        count++;
    }
    //console.log("our", our_pred)
    //console.log("actual", prediction.subset(math_js.index(i, 0)))
    //console.log("delta", delta)
    //sum += delta;
}
console.log("rows ",rows, " count", count);

console.log("This is the weights:", weights);
console.log("This is beta", beta);