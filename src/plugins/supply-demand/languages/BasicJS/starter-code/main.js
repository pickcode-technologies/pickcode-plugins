// Base curves are created automatically when you use shift functions!

// Shift the curves using simple functions
addSupply(0.5);  // Shift supply curve right by 0.5
addDemand(0.3);    // Shift demand curve right by 0.3
addDrought(5);    // Shift supply curve left by 50 (5 * 10)

// Show equilibrium point and helper lines
showHelpers(); 


// Set price and quantity
setPrice(0.5);
setQuantity(0.5);

// Cool animation to see the equilibrium point move
let counter = 0;

let id = setInterval(() => {
     addDemand(0.001);
     drawHelpers();
     if (++counter == 1000) clearInterval(id);
}, 5);