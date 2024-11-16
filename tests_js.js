const { MongoClient, ConnectionClosedEvent } = require("mongodb");

// Dados de conexão
const username = "admin";
const password = "admin";
const cluster = "localhost:27017";
const dbname = "client_adm";
const collectionName = "clients";
const collectionName_orders = "orders";
const collectionName_personal_service = "personal_service";

const uri = `mongodb://${username}:${password}@${cluster}/?authSource=admin`;
const client_mongo = new MongoClient(uri);
//Banco de pedidos
const database = client_mongo.db(dbname);
const collection = database.collection(collectionName);
//Banco de pedidos confirmados
const database_orders = client_mongo.db(dbname);
const collection_orders = database_orders.collection(collectionName_orders);

const cardapio = {
    produtos: [

        { type: "Frango com Catupiry", value: 25.99 },
        { type: "Pepperoni", value: 28.99 },
        { type: "4 Queijos", value: 30.99 },
        { type: "Margherita", value: 30.99 },
        { type: "Calabresa", value: 26.99 },
        { type: "Vegetariana", value: 24.99 },
        { type: "Portuguesa", value: 29.99 },
        { type: "Napolitana", value: 28.99 },
        { type: "Atum", value: 32.99 },
        { type: "Chocolate", value: 22.99 },
        { type: "Margherita e Pepperoni", value: 28.99 },
        { type: "4 Queijos e Frango Catupiry", value: 29.99 },
        { type: "Calabresa e Vegetariana", value: 27.99 },
        { type: "Portuguesa e Napolitana", value: 30.99 },
        { type: "Atum e Chocolate", value: 33.99 },
        { type: "Margherita e 4 Queijos", value: 26.99 },
        { type: "Frango e Calabresa", value: 27.50 },
        { type: "Vegetariana e Portuguesa", value: 28.50 },
        { type: "Napolitana e Atum", value: 31.99 },
        { type: "Pepperoni e Chocolate", value: 27.99 }

    ],
    tipos: [{
        title: "Pizzas_Normais",
        inicio: 0,
        fim: 9
    },
    {
        title: "Pizzas Meio a Meio",
        inicio: 10,
        fim: 19
    }]
};
async function add_client(phone) {//add new client in data base
    try {
        await client_mongo.connect();
        const doc = {
            etapa: 1,
            phone: phone,
            address: " ",
            city: "",
            bairro: "",
            num: -1,
            rua: "",
            frete: -1,
            name: " ",
            orders: [],
            money: -1
        }
        const result = await collection.insertOne(doc);
        // Print the ID of the inserted document
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
        // Close the MongoDB client connection
        await client_mongo.close();
    }
}
async function add_orders(phone_filter, array_add, array_data) {
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        orders_for_add = array_add.map(indice => array_data[indice]);
        const update = { $push: { orders: { $each: orders_for_add } } }
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function orders_dell(phone_filter, array_dell) {
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        let result = await collection.findOne(filter);
        orders_for_dell = array_dell.map(indice => result.orders[indice]);
        const update = { $pull: { orders: { $in: orders_for_dell } } }
        result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}

//const texto = "11 quero ,2 a 5 e 7 e 18 fode com a 1 ";
const adicionar = "1";
const exluir = "fode com a 2, tira o 1, e o 0 ";
// Extrair números usando expressão regular
let array_add = adicionar.match(/\d+/g).map(Number);
let array_dell = exluir.match(/\d+/g).map(Number);

const num = '81999999666';

let x, y, z;
y = 0
x = 0
/*
cardapio.produtos.forEach(element => {
    if (cardapio.tipos[x].inicio == y) {
        console.log("\n"+cardapio.tipos[x].title+"\n ");
        if( x < cardapio.tipos.length - 1){
            x++;
        }
    }
    console.log(y + " " + element.type + "\tR$ " + element.value);
    y++;
});
console.log("\n\n");
*/
//console.log("\n"+array_add);
//add_client(num).catch(console.dir);
//add_orders(num, array_add,cardapio.produtos).catch(console.dir);
//orders_dell(num, array_dell).catch(console.dir);

/*
y = 0
produtosSelecionados.forEach(element => {
    console.log(y + " " + element.type + "\tR$ " + element.value);
    y++;
});

function contemNumeros(str) {
    return str.match(/\d/) !== null;
}
let fode = 1;
// Exemplos de uso
console.log(contemNumeros(fode.toString()));  // true
console.log(contemNumeros("Olá Mundo"));  // false
*/

const numeros = [10, 5, 8, 21, 7, 3];

// Encontrar o valor máximo
const max = Math.max(numeros);
console.log(`Máximo: ${max}`);

// Encontrar o valor mínimo
const min = Math.min(...numeros);
console.log(`Mínimo: ${min}`);
const min = Math.min(...numeros);
console.log(`Mínimo: ${min}`);

