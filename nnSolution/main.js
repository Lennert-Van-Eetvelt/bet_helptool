let net = new brain.NeuralNetwork();

// net.train([
//     {input: [0,0], output:[0]},
//     {input: [0,1], output:[1]},
//     {input: [1,0], output:[1]},
//     {input: [1,1], output:[0]}
// ]);
let trainingData = [];
// for (let i = 0; i< 5; i++){
for (let i = 0; i < allGames.length; i++) {
    let game = allGames[i];
    let winner = getVirtualWinner(game);
    let rnds = getWinnerRounds(game);
    let mxOdds = maxOdds(game);
    let sets = [0, 0];
    for (let m = 0; m < rnds.length; m++)
        if (rnds[m] === "a")
            sets[0]++;
        else
            sets[1]++;

    for (let k = 0; k < game.states.length; k++) {
        let state = game.states[k];
        let points = getSetPoints(state);
        let scoreRising = getScoreRising(state);

        let ipA = [game.beginOddsA, state.oddA, sets[0], sets[1],scoreRising[0]]
        let outA = 0;
        // if (winner === "a")
        //     outA = state.oddA;
        // else
            outA = state.oddA/mxOdds[0]
        trainingData.push({input: ipA, output: [outA]})

        let ipB = [game.beginOddsB, state.oddB, sets[1],sets[0], scoreRising[1]]
        let outB = 0;
        // if (winner === "b")
        //     outB = state.oddB;
        // else
            outB = state.oddB/mxOdds[1]
        trainingData.push({input: ipB, output: [outB]})
        //
        if (i===0 && k ===30)
            console.log(trainingData)
    }
}
// console.log(net.toJSON())

net.train(trainingData)

console.log(net.run([1.1, 1.06, 3, 7, 2, 4]))
console.log(net.run([1.1, 1.09, 3, 10, 2, 9]))
console.log(net.run([1.1, 1.09, 3, 10, 2, 9]))
console.log(net.run([6, 10, 2, 4, 3, 7]))
console.log(net.run([1.6, 1, 2, 5, 45, 2]))