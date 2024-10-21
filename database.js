const mongoose = require('mongoose');
// mongoose.connect(`mongodb+srv://vp_user1:swyPXBv3QG9QWwKv@vechicleparking.awdun3x.mongodb.net/VehicleParkingDB?retryWrites=true&w=majority`,
//     { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(`mongodb+srv://Vehicle_User01:bBoT4b2dkxsN3mg7@cluster0.kx2wa.mongodb.net/ShineDB?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true });

    
const db = mongoose.connection;
db.on("error", () => {
    console.log("> error occurred from the database");
});
db.once("open", () => {
    console.log("> successfully opened the database");
});
module.exports = mongoose;

