const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const NodeGeocoder = require('node-geocoder');
const { MongoClient } = require("mongodb");

//Criação de cliente e strategia de salvamento local
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth({
        dataPath: 'LocalAuth_salves',
        clientId: "client-Alex"
    })
});

client.on("ready", async () => {
    console.log("READY");
    client.pupPage.on("pageerror", function (err) {
        console.log("Page error: " + err.toString());
    });
    client.pupPage.on("error", function (err) {
        console.log("Page error: " + err.toString());
    });
});
client.on("qr", qr => {
    qrcode.generate(qr, { small: true });
});
client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});
client.on("auth_failure", msg => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
});
client.initialize();

const precision = 2;
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
        title: "Pizzas Normais",
        inicio: 0,
        fim: 9
    },
    {
        title: "Pizzas Meio a Meio",
        inicio: 10,
        fim: 19
    }]
};

const cidadesDePE = {
    "Recife": ["Santo Amaro", "Boa Vista", "Cidade Universitária", "Pina", "Cajueiro Seco"],
    "Jaboatão dos Guararapes": ["Cajueiro Seco", "Prazeres", "Guararapes", "Candeias", "Barro", "Piedade"],
};
const citys = ["Recife", "Jaboatão dos Guararapes"];

let result;
let x;
let msg_aux;
let data = "";
let option_pag = 0;
let index = 0;
let saudacao;
let despedida;
let array_aux = [];

let agora = new Date();
let horas = agora.getHours();

if (horas >= 5 && horas < 12) {
    saudacao = "Bom dia ☀️";
    despedida = "Tenha um Ótimo Dia ☀️";
} else if (horas >= 12 && horas < 18) {
    saudacao = "Boa tarde ☀️";
    despedida = "Tenha uma Ótima Tarde ☀️";
} else {
    saudacao = "Boa noite 🌛​";
    despedida = "Tenha uma Ótima Noite 🌛​";
}

const company_name = "CU";
let msg_initial = `🟢​\t${saudacao}\n\nBem vindo ao atendimento ${company_name}\n`;

const msg_inicial_cardapio = `Seja Bem vindo a pizzaria ${company_name}\n\nDigite uma ou varias opções\n\n\tCardapio:\n`;
msg_aux = msg_inicial_cardapio;
x = 0;
y = 0;
cardapio.produtos.forEach(element => {
    if (cardapio.tipos[y].inicio == x) {
        msg_aux += `\n\t${cardapio.tipos[y].title}\n\n`;
        if (y < cardapio.tipos.length - 1) {
            y++;
        }
    }
    msg_aux += `${x} 👉​${element.type}\n👇\nR$ ${element.value}\n\n`
    x++;
});

const msg_fim_cardapio = `\nDigite uma ou varias opções\n\n#️⃣ Para falar com um de nossos atendentes`
msg_aux += msg_fim_cardapio;
const orders = msg_aux

const edition = `🅾️Editar ✏️`;
const returne = `🅱️Voltar ⬅️Cardapio`;
const confirmation = `🅰️Confirmar ✅`;

const money_type = "✅\tQual a forma de pagamento \n\n1️⃣Dinheiro\n2️⃣Cartão 💳\n3️⃣Pix";
const option_inval = "❌​\tOpção invalida";
const personal_service = `\t💬 Aguarde um de nossos atendentes\n\n${returne}`;

const pag_money = `✅\tForma de Pagamento:\n\n\tDinheiro\n\n${returne}​\n${confirmation}\n`;
const pag_cart = `✅\tForma de Pagamento:\n\n\tCartão 💳\n\n${returne}​\n${confirmation}\n`;
const pag_pix = `✅\tForma de Pagamento:\n\n\tPix\n\n${returne}​\n${confirmation}\n`;

const pag_type_money = "Dinheiro";
const pag_type_cart = "Cartão 💳";
const pag_type_pix = "Pix";

const msg_dell_orders = `❌\t​Pedidos Vazios\n\nEncerrar Atendimento ?\n\n${returne}​\n${confirmation}\n`;
const end_atendiment = `​👍 Atendimento encerrado\n\n${despedida}`;
const dell_confirmation = `❌\tPedidos Exluido\n${end_atendiment}`;

const get_the_name = `✏️ ​Informe o nome do Cliente`;
const text_tab = `\n`;

// Dados de conexão
const username = "admin";
const password = "admin";
const cluster = "zapiup.sytes.net:27017";
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
//Banco de personal_service
const databse_personal_service = client_mongo.db(dbname);
const collection_personal_service = databse_personal_service.collection(collectionName_personal_service);

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
async function set_etapa(phone_filter, num) {//update etapa que controla os estados do cliente
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { etapa: num } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
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
async function dell_orders(phone_filter, array_dell) {
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
async function update_frete(phone_filter, frete) {//update do endereço do cliente para entrega e checagem do frete
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { frete: frete } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function update_name(phone_filter, name_new) {//update do nome do cliente para entrega do pedido
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { name: name_new } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function update_money(phone_filter, money_option) {//update da forma de pagamento
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { money: money_option } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function update_city(phone_filter, value) {//update do nome do cliente para entrega do pedido
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { city: value } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function update_bairro(phone_filter, value) {//update do nome do cliente para entrega do pedido
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { bairro: value } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function update_num(phone_filter, value) {//update do nome do cliente para entrega do pedido
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { num: value } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}
async function update_rua(phone_filter, value) {//update do nome do cliente para entrega do pedido
    try {
        await client_mongo.connect();
        const filter = { phone: phone_filter };
        const update = { $set: { rua: value } };
        const result = await collection.updateOne(filter, update);
        console.log(`${result.matchedCount} documento(s) encontrado(s)`);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
    } finally {
        await client_mongo.close();
    }
}

// Configurar o NodeGeocoder com sua chave de API
const options = {
    provider: 'google',
    apiKey: 'AIzaSyA-5crHg06fNQVBN0gOW2ImdC3CBEhfbF8', // Substitua pela sua chave de API do Google Maps
};
const geocoder = NodeGeocoder(options);
// Função para obter coordenadas de um endereço
async function obterCoordenadas(endereco) {
    try {
        const res = await geocoder.geocode(endereco);
        if (res.length > 0) {
            const { latitude, longitude } = res[0];
            return { latitude, longitude };
        } else {
            throw new Error('Endereço não encontrado');
        }
    } catch (error) {
        console.error('Erro ao obter coordenadas:', error);
    }
}
// Função para calcular a distância usando a Fórmula de Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;

    return R * 2 * Math.asin(Math.sqrt(a));
}
async function calcularFrete(origem, destino, custoPorKm, phone) {
    const coordenadasOrigem = await obterCoordenadas(origem);
    const coordenadasDestino = await obterCoordenadas(destino);
    if (coordenadasOrigem && coordenadasDestino) {
        const distancia = calcularDistancia(
            coordenadasOrigem.latitude,
            coordenadasOrigem.longitude,
            coordenadasDestino.latitude,
            coordenadasDestino.longitude
        );
        const valorFrete = distancia * custoPorKm;
        console.log(`Distância: ${distancia.toFixed(2)} km`);
        console.log(`Valor do Frete: R$ ${valorFrete.toFixed(2)}`);
        await update_frete(phone, valorFrete).catch(console.dir);
    } else {
        console.log('Não foi possível calcular a distância e o valor do frete.');
    }
}
async function calc_frete(data) {
    // Substitua pelos endereços desejados e custo por quilômetro
    const enderecoOrigem = 'R. do Cajueiro, 734 - Cajueiro Seco, Jaboatão dos Guararapes - PE';
    let enderecoDestino = "R. " + data.rua + ", " + data.num + " - " + data.bairro + ", " + data.city + " - PE";
    const custoPorKm = 5.00;
    calcularFrete(enderecoOrigem, enderecoDestino, custoPorKm, data.phone);
}


client.on("message", async msg => {
    try {
        horas = agora.getHours();
        if (horas >= 5 && horas < 12) {
            saudacao = "Bom dia ☀️";
            despedida = "Tenha um Ótimo Dia ☀️";
        } else if (horas >= 12 && horas < 18) {
            saudacao = "Boa tarde ☀️";
            despedida = "Tenha uma Ótima Tarde ☀️";
        } else {
            saudacao = "Boa noite 🌛​";
            despedida = "Tenha uma Ótima Noite 🌛​";
        }
        await client_mongo.connect();
        const filter = { phone: msg.from };
        result = await collection.findOne(filter);
        data = "";
        option_pag = 0;
        index = 0;
        msg_aux = '';
        if (result) {
            console.log(`Cliente ${msg.from} em Atendimento`);
            switch (result.etapa) {
                case 1://Opções de cidade
                    data = `✅\tSelecione Sua Cidade:\n\n`;
                    x = 0;
                    citys.forEach(element => {
                        data += `${x + 1} 👉​${element}\n`;
                        x++
                    });
                    msg_aux = `${data}\n\n`;
                    if (msg.body.length == 1) {
                        index = parseInt(msg.body) - 1;
                        x = 0;
                        citys.forEach(element => {
                            if (index == x) {
                                update_city(msg.from, element).catch(console.dir);
                                msg_aux = `✅\tCidade:\n\t${element}\n\n${edition}​\n${confirmation}\n`;
                                client.sendMessage(msg.from, msg_aux);
                            }
                            x++
                        });
                        if (result.city != "") {
                            if (msg.body === "A") {
                                x = 0;
                                data = `✅\tSelecione Seu Bairro:\n`;
                                cidadesDePE[result.city].forEach(element => {
                                    data += `${x + 1} 👉​${element}\n`;
                                    x++
                                });
                                msg_aux = `${data}\n\n`;
                                set_etapa(msg.from, 2).catch(console.dir);
                                client.sendMessage(msg.from, msg_aux);
                            } else if (msg.body === "O") {
                                client.sendMessage(msg.from, msg_aux);
                            }
                        }
                    } else {
                        client.sendMessage(msg.from, msg_aux);
                    }
                    break;
                case 2://Opções de bairro
                    x = 0;
                    data = `✅\tSelecione Seu Bairro:\n`;
                    cidadesDePE[result.city].forEach(element => {
                        data += `${x + 1} 👉​${element}\n`;
                        x++
                    });
                    msg_aux = `${data}\n\n`;
                    if (msg.body.length == 1) {
                        index = parseInt(msg.body) - 1;
                        x = 0;
                        cidadesDePE[result.city].forEach(element => {
                            if (index == x) {
                                update_bairro(msg.from, element).catch(console.dir);
                                msg_aux = `✅\tBairro:\n\t${element}\n\n${edition}​\n${confirmation}\n`;
                                client.sendMessage(msg.from, msg_aux);
                            }
                            x++
                        });
                        if (result.bairro != "") {
                            if (msg.body === "A") {
                                msg_aux = `✅\tInforme o Numero de sua Residencia/Apartamento:\n`;
                                set_etapa(msg.from, 3).catch(console.dir);
                                client.sendMessage(msg.from, msg_aux);
                            } else if (msg.body === "O") {
                                client.sendMessage(msg.from, msg_aux);
                            } else {
                                client.sendMessage(msg.from, option_inval);
                            }
                        }
                    } else {
                        client.sendMessage(msg.from, option_inval);
                    }
                    break;
                case 3://Opções de numero
                    if (!(msg.body === "A") && !(msg.body === "O")) {
                        msg_aux = `✅\tNumero:\n\t${msg.body}\n\n${edition}​\n${confirmation}\n`;
                        update_num(msg.from, msg.body).catch(console.dir);
                        client.sendMessage(msg.from, msg_aux);
                    }
                    if (msg.body === "A") {
                        msg_aux = `✅\tDigite o nome da sua Rua:\n`;
                        set_etapa(msg.from, 4).catch(console.dir);
                        client.sendMessage(msg.from, msg_aux);
                    } else if (msg.body === "O") {
                        msg_aux = `✅\tInforme o Numero de sua Residencia/Apartamento:\n`;
                        client.sendMessage(msg.from, msg_aux);
                    }
                    break;
                case 4://Opções Nome da rua
                    if (!(msg.body === "A") && !(msg.body === "O")) {
                        msg_aux = `✅\t${msg.body}\n\n${edition}​\n${confirmation}\n`;
                        update_rua(msg.from, msg.body).catch(console.dir);
                        client.sendMessage(msg.from, msg_aux);
                    }
                    if (msg.body === "A") {
                        set_etapa(msg.from, 5).catch(console.dir);
                        calc_frete(result).catch(console.dir);
                        client.sendMessage(msg.from, get_the_name);
                    } else if (msg.body === "O") {
                        msg_aux = `✅\tDigite o nome da sua Rua:\n`;
                        client.sendMessage(msg.from, msg_aux);
                    }
                    break;
                case 5://Opções de nome \n${returne}​\n${confirmation}\n`;
                    if (msg.body.length >= 3) {
                        msg_aux = `✅\tConfirmar Nome\n\n${msg.body}\n\n${edition}​\n${confirmation}\n`;
                        update_name(msg.from, msg.body).catch(console.dir);
                        client.sendMessage(msg.from, msg_aux);
                    } else if (msg.body === "A") {
                        calc_frete(result);
                        set_etapa(msg.from, 6).catch(console.dir);
                        client.sendMessage(msg.from, orders);
                    } else if (msg.body === "O") {
                        client.sendMessage(msg.from, get_the_name);
                    } else {
                        client.sendMessage(msg.from, option_inval);
                    }
                    break;
                case 6://Opções de pedidos
                    //Criação do menu de pedidos
                    //index = parseInt(msg.body) - 1;
                    if (msg.body.match(/\d/)) {
                        array_aux = msg.body.match(/\d+/g).map(Number);
                        if (Math.max(...array_aux) <= (cardapio.produtos.length - 1)) {
                            add_orders(msg.from, array_aux, cardapio.produtos).catch(console.dir);
                            x = 0
                            data = array_aux.map(indice => cardapio.produtos[indice]);
                            msg_aux = `✅\tAdicionado:\n`;
                            data.forEach(element => {
                                msg_aux += `${element.type}\n`;
                            });
                            msg_aux += `\n\n${edition}\n${returne}\n${confirmation}\n`;
                            client.sendMessage(msg.from, msg_aux);
                        } else {
                            client.sendMessage(msg.from, option_inval);
                        }
                    } else if (msg.body === "#") {
                        await collection_personal_service.insertOne({ phone: msg.from });
                        await collection.deleteOne(filter);
                        client.sendMessage(msg.from, personal_service);
                        set_etapa(msg.from, 10).catch(console.dir);
                    } else if (msg.body === "O") {
                        data = text_tab;
                        x = 0;
                        total = 0;
                        result.orders.forEach(element => {
                            total += element.value;
                            data += `${x} 👉​${element.type}\n👇\nR$ ${element.value}\n\n`;
                            x++;
                        });
                        msg_aux = `✅\tPedidos Confirmados\n${data}\nTotal: R$ ${total.toFixed(precision)}\nDigite as opções que deseja excluir do pedido\n\n${confirmation}\n`;
                        client.sendMessage(msg.from, msg_aux);
                        set_etapa(msg.from, 7).catch(console.dir);
                    } else if (msg.body === "B") {
                        client.sendMessage(msg.from, orders);
                    } else if (msg.body === "A") {
                        client.sendMessage(msg.from, money_type);
                        set_etapa(msg.from, 8).catch(console.dir);
                    } else {
                        client.sendMessage(msg.from, option_inval);
                    }
                    break;
                case 7://Opções de edição de produtos
                    data = text_tab;
                    x = 0;
                    total = 0;
                    result.orders.forEach(element => {
                        total += element.value;
                        data += `${x} 👉​${element.type}\n👇\nR$ ${element.value}\n\n`;
                        x++;
                    });
                    msg_aux = `✅\tPedidos Confirmados\n${data}\nTotal:\tR$ ${total.toFixed(precision)}\nDigite as opções que deseja excluir do pedido\n\n${returne}\n${confirmation}\n`;
                    if (msg.body === "O") {
                        client.sendMessage(msg.from, msg_aux);
                    } else if (msg.body === "B") {
                        client.sendMessage(msg.from, orders);
                        set_etapa(msg.from, 6).catch(console.dir);
                    } else if (msg.body === "A" && result.orders.length > 0) {
                        client.sendMessage(msg.from, money_type);
                        set_etapa(msg.from, 8).catch(console.dir);
                    } else {
                        if (result.orders.length > 0) {
                            if (msg.body.match(/\d/)) {
                                array_aux = msg.body.match(/\d+/g).map(Number);
                                if (Math.max(...array_aux) <= (result.orders.length - 1)) {
                                    let arrays = array_aux.map(indice => result.orders[indice]);
                                    x = 0;
                                    total = 0;
                                    data = '';
                                    arrays.forEach(element => {
                                        //total += element.value;
                                        data += `❌ 👉​${element.type}\n👇\nR$ ${element.value}\n\n`;
                                        x++;
                                    });
                                    msg_aux = `✅\tPedidos Exluidos\n${data}${edition}\n${returne}\n${confirmation}\n`;
                                    dell_orders(msg.from, array_aux);
                                    client.sendMessage(msg.from, msg_aux);
                                    console.log("Elemento removido do array e documento atualizado.");
                                } else {
                                    client.sendMessage(msg.from, option_inval);
                                }
                            }
                        } else if (result.orders.length == 0) {
                            //client.sendMessage(msg.from, msg_dell_orders);
                            // falta imprementar --------------------------------------------------------<
                            if (msg.body === "A") {
                                //escluir dados
                                await collection.deleteOne(filter);
                                client.sendMessage(msg.from, dell_confirmation);
                            } else if (msg.body === "B") {
                                //voltar para cardapio
                                set_etapa(msg.from, 6).catch(console.dir);
                                client.sendMessage(msg.from, orders);
                            } else {
                                client.sendMessage(msg.from, option_inval);
                            }
                        }
                    }
                    break;
                case 8://Opções de pagamento
                    //criação de string do menu de dados
                    data = text_tab;
                    total = 0
                    result.orders.forEach(element => {
                        total += element.value;
                        data += `${element.type}\nR$ ${element.value}\n`;
                    });
                    total += result.frete;
                    //Area de teste e debug
                    if (msg.body === "4") {
                        client.sendMessage(msg.from, menuFormatado);
                    }
                    //Conferindo opção de pagamento
                    if (result.money == 1) {
                        option_pag = pag_type_money;
                    } else if (result.money == 2) {
                        option_pag = pag_type_cart;
                    } else if (result.money == 3) {
                        option_pag = pag_type_pix;
                    }
                    //Opções de pagamento
                    if (msg.body === "1") {// dinheiro
                        update_money(msg.from, 1).catch(console.dir);
                        client.sendMessage(msg.from, pag_money);
                    } else if (msg.body === "2") {// cartão
                        update_money(msg.from, 2).catch(console.dir);
                        client.sendMessage(msg.from, pag_cart);
                    } else if (msg.body === "3") {// pix
                        update_money(msg.from, 3).catch(console.dir);
                        client.sendMessage(msg.from, pag_pix);
                    } else if (msg.body === "O") {
                        set_etapa(msg.from, 1).catch(console.dir);
                        client.sendMessage(msg.from, orders);
                    } else if (msg.body === "B") {
                        set_etapa(msg.from, 6).catch(console.dir);
                        client.sendMessage(msg.from, orders);
                    } else if (msg.body === "A") {
                        set_etapa(msg.from, 9).catch(console.dir);
                        msg_aux = `✅\tPedidos \n${data}\nFrete:\tR$ ${result.frete.toFixed(precision)}\nTotal:\tR$ ${total.toFixed(precision)}\n✅\tPagamento:\n${option_pag}\n✅\tEndereço:\nR. ${result.rua} Nº ${result.num}\n${result.bairro} - ${result.city}, PE\n✅\tCliente:\n${result.name}\n✅\tNumero: \n${msg.from.match(/\d+/)[0]}\n\n${edition}\n${returne}\n​​${confirmation}\n `;
                        client.sendMessage(msg.from, msg_aux);
                    } else {
                        client.sendMessage(msg.from, option_inval);
                    }
                    break;
                case 9://Opções de confirmação de pedido
                    data = text_tab;
                    total = 0
                    result.orders.forEach(element => {
                        total += element.value;
                        data += `${element.type}\nR$ ${element.value}\n`;
                    });
                    total += result.frete;
                    //Conferindo opção de pagamento
                    if (result.money == 1) {
                        option_pag = pag_type_money;
                    } else if (result.money == 2) {
                        option_pag = pag_type_cart;
                    } else if (result.money == 3) {
                        option_pag = pag_type_pix;
                    }
                    if (msg.body === "A") {
                        msg_aux = `✅\tPedidos Em fila de preparação\n${data}\nFrete:\tR$ ${result.frete.toFixed(precision)}\nTotal:\tR$ ${total.toFixed(precision)}\n✅\tPagamento:\n${option_pag}\n✅\tEndereço:\nR. ${result.rua} Nº ${result.num}\n${result.bairro} - ${result.city}, PE\n✅\tCliente:\n${result.name}\n✅\tNumero: \n${msg.from.match(/\d+/)[0]}\n\nFinalizado✅\nAvisaremos quando o pedido sair pra entrega 🛵\n\n\t\t${end_atendiment}​`;
                        client.sendMessage(msg.from, msg_aux);
                        await collection_orders.insertOne(result);
                        await collection.deleteOne(filter);
                    } else if (msg.body === "B") {
                        set_etapa(msg.from, 6).catch(console.dir);
                        client.sendMessage(msg.from, orders);
                    } else {
                        client.sendMessage(msg.from, option_inval);
                    }
                    break;
                case 10://Opções pesonal_service
                    if (msg.body === "A") {
                        set_etapa(msg.from, 1).catch(console.dir);
                        await collection.deleteOne(filter);
                        client.sendMessage(msg.from, orders);
                    } else {
                        client.sendMessage(msg.from, personal_service);
                    }
                    break;
                default:
                    // Este ponto nunca deve ser alcançado devido à verificação inicial
                    throw new Error("Opção inválida, etapa fora do escorpo do projeto");
            }
        } else {
            console.log(`Novo Cliente ${msg.from} Cadastrado`);
            data = `Selecione Sua Cidade:\n\n`;
            x = 0;
            citys.forEach(element => {
                data += `${x + 1} 👉​${element}\n`;
                x++
            });
            msg_aux = msg_initial + `${data}`;
            client.sendMessage(msg.from, msg_aux);
            add_client(msg.from)
        }
    } catch (error) {
        console.error('Ocorreu um erro:', erro);
    }
});