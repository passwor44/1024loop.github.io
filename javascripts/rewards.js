const REWARDS = [
    [
        () => [new Variable(['a','b','c','d','e','f'][Math.floor(Math.random() * 6)]), randInt(1,3)],
        () => [new Constant(randInt(1,10)), randInt(1,3)],
        () => [new Operator(OperatorType.SetVariable), 1],
        () => [new Operator(OperatorType.Sum), randInt(1,2)],
        () => [new Operator(OperatorType.AddVariable), 1],
    ],
    [
        () => [new Operator(OperatorType.Product, null, new Slot(0, new Constant(randInt(2,3)), true)), 1],
        () => [new Operator(OperatorType.MultVariable, null, new Slot(0, new Constant(randInt(2,3)), true)), 1],
        () => [new Operator(OperatorType.Logarithm), 1],
        () => [new Operator(OperatorType.Logarithm, new Slot(0, new Variable("P"), true)), randInt(1,2)],
        () => [new Constant(randInt(11,100)), randInt(1,3)],
    ],
    [
        () => [new Operator(OperatorType.Product), 1],
        () => [new Operator(OperatorType.MultVariable), 1],
        () => [new Operator(OperatorType.Exponent, null, new Slot(0, new Constant(2), true)), 1],
    ],
    [
        () => [new Operator(OperatorType.Exponent, null, new Slot(0, new Constant(3), true)), 1],
        () => [new Operator(OperatorType.Exponent, null, new Slot(0, new Operator(OperatorType.Logarithm, new Slot(0, new Operator(OperatorType.Logarithm), true)), true)), 1],
        () => [new Operator(OperatorType.Repeat, new Slot(4, new Constant(2 + Math.floor(-logBase(Math.random(),3))), true)), 1],
    ],
    [
        () => [new Operator(OperatorType.Exponent, null, new Slot(0, new Operator(OperatorType.Logarithm), true)), 1],
        () => [new Operator(OperatorType.MultVariable, new Slot(2, new Variable("P"), true), new Slot(0, new Operator(OperatorType.Logarithm), true)), 1],
    ],
    [
        () => [new Variable("P"), randInt(1,3)],
        () => [new Operator(OperatorType.Exponent), 1],
        () => [new Operator(OperatorType.Repeat, new Slot(4)), 1],
        () => [new Operator(OperatorType.Tetrate, null, new Slot(0, new Constant(2), true)), 1],
    ],
    [
    		() => [new Operator(OperatorType.Tetrate, null, new Slot(0, new Operator(OperatorType.Logarithm, new Slot(0, new Operator(OperatorType.SuperLogarithm), true)), true)), 1],
    ]
]

//const REWARD_CHANCES = [1,1/5,1/25,1/100,1/300,1/2000,0]
function REWARD_CHANCES() {
	return [1, 6/7,5/7,4/7,3/7,2/7,1/7,0]
	if (player.achievements[2] == 2) return [1, 0.6, 0.3, 0.05, 0.02, 0.01, 0.01 / 100, 0]
	return [1,1/5,1/25,1/100,1/300,1/2000,0,0]
}

const REWARD_RARITIES = [
    ["common", "#bdfffa"],
    ["uncommon", "#00ff84"],
    ["minus", "#00ffb4"],
    ["repeat", "#00f5ff"],
    ["exponential", "#00a6ff"],
    ["superposition", "#0031ff"],
    ["concept", "#3600ff"]
]

function calculateRewards(count = getRewardCount()[1]) {
    const rewards = [];

    for (let i = 0; i < count; i++) {
        const chance = Math.random()

        for (let j = 0; j < REWARD_CHANCES().length - 1; j++) {
            var c = REWARD_CHANCES()[j+1] // j === 2 ? 1 / Math.max(200, 1000 / player.nextP.add(9).log10().cbrt()) :

            if (chance < c) continue;

            if (j >= 3) unlockAchievement(2);
            
            if (j >= 4) {
            		unlockAchievement(2, 2);
            		count = getRewardCount()[1]
            };
            
            if (j >= 5) unlockAchievement(2, 3);

            const R = REWARDS[j]

            rewards.push(R[Math.floor(R.length * Math.random())]().concat(j))

            break;
        }
    }

    // rewards.forEach(x => increaseSlot(...x))

    return rewards
}

function claimRewards(norandom = false) {
    player.choosedRewards.forEach(x => {
        var r = player.rewards[x]
        increaseSlot(...r)
        r = r[0]
        if (r instanceof Variable && !player.new_variables.has(r.id)) {
            player.new_variables.add(r.id)
            increaseSlot(new Operator(0, new Slot(2, new Variable(r.id), true)),1)
            increaseSlot(new Constant(randInt(1,10)),1)
        }
    })

    /*
    let R = [0,1,2,3,4,5].filter(x => !player.choosedRewards.has(x));

    if (!norandom) for (let i = 0; i < 3 - player.choosedRewards.size; i++) {
        var r = player.rewards[R.splice(Math.floor(Math.random() * R.length),1)[0]]
        increaseSlot(...r)
        r = r[0]
        if (r instanceof Variable && !player.new_variables.has(r.id)) {
            player.new_variables.add(r.id)
            increaseSlot(new Operator(0, new Slot(2, new Variable(r.id), true)),1)
            increaseSlot(new Constant(1),1)
        }
    }
    */

    try {
        if (new Set(['a','b','c','d','e','f']).intersection(player.new_variables).size >= 6) unlockAchievement(3);
    } catch {};

    player.choosedRewards.clear()
    player.rewards = []

    player.completed = false;
    player.nextP = player.variables.P.gte(Number.MAX_VALUE) ? player.variables.P.pow(player.variables.P.log10().log10().div(10).add(1)) : player.variables.P.mul(10);

    player.level++;
}

function rerollRewards(force) {
    if (!force && player.reroll <= 0) return;

    if (!force) {
        player.reroll--;
        ACHIEVEMENT_CONDITIONS[16] = false;
    }
    player.choosedRewards.clear()

    player.rewards = calculateRewards()
}

function getRewardCount() {
	if (player.achievements[2] == 3) return [15, 15]
	if (player.achievements[2] == 2) return [6, 12]
	else return [3, 6]
}