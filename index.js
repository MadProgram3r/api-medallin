const express = require('express');
const morgan = require('morgan');
const fs     = require('fs');
const path   = require('path');
const mysql = require('mysql2/promise');
const { json } = require('body-parser');
const { SwaggerTheme } = require('swagger-themes');
const { query } = require('express');
const basicAuth = require('express-basic-auth');
var cors = require('cors');
var multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const prueba = require('./prueba.js')
const redoc = require('redoc-express');
const swaggerUI     = require('swagger-ui-express');
const swaggerJsDoc  = require('swagger-jsdoc');

const def = fs.readFileSync(path.join(__dirname,'./swaggerOptions.json'),
    {encoding:'utf8', flag:'r'});
const read = fs.readFileSync(path.join(__dirname,'./README.MD'),{encoding:'utf8',flag:'r'})

const defObj = JSON.parse(def)
defObj.info.description = read;

const swaggerOptions = {
    definition:defObj,
    apis:[`${path.join(__dirname,"./index.js")}`]
}
const theme = new SwaggerTheme('v3');

const options = {
    explorer: true,
    customCss: theme.getBuffer('muted')
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);



const app = express();
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs,options));
app.use("/api-docs.json",(req,res)=>{
    res.json(swaggerDocs);
});

app.get(
    '/api-docs.redoc',
    redoc({
      title: 'API Docs',
      specUrl: '/api-docs.json',
      nonce: '', // <= it is optional,we can omit this key and value
      // we are now start supporting the redocOptions object
      // you can omit the options object if you don't need it
      // https://redocly.com/docs/api-reference-docs/configuration/functionality/
      redocOptions: {
        theme: {
          colors: {
            primary: {
              main: '#6EC5AB'
            }
          },
          typography: {
            fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
            fontSize: '15px',
            lineHeight: '1.5',
            code: {
              code: '#87E8C7',
              backgroundColor: '#4D4D4E'
            }
          },
          menu: {
            backgroundColor: '#ffffff'
          }
        }
      }
    })
  );

app.use('/prueba',prueba.router);

let objeto = {  Nombre : '',
                Precio : '',
                Existencias : '',
                Tipo: ''}

var accessLogStream = fs.createWriteStream(path.join(__dirname,'access.log'),{flags:'a'})
app.use(morgan('combined', {stream: accessLogStream}));
/** app.use(basicAuth({
    users: { 'MadProgram3r': '12345' }
}))**/
app.use(express.json());
app.use(express.urlencoded())
app.use(cors());

app.use(express.urlencoded({ extended: true }));

app.get("/ServidorExpress",(req,res)=>{
    res.json({respuesta:"Contestando"})
});

app.get("/medicamentos", (req, res,next) => {
    try {
    throw new Error('Fallo aqui');
    mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'medicalsearch' })
        .then(conn => conn.query('SELECT * from medicamentos'))
        .then(([rows, fields]) => res.json(rows));
    } catch (e){
        console.log(e.message);
        er = new Error('Algo salio mal');
        next(er);
    }

});

/**
 * @swagger
{
  "swagger": "2.0",
  "info": {
    "version": "1.0.0",
    "title": "Farmacias API",
    "description": "API para consultar información de farmacias"
  },
  "paths": {
    "/farmacias/": {
      "get": {
        "tags": ["farmacias"],
        "summary": "Consultar las farmacias",
        "description": "Trae todas las farmacias",
        "responses": {
          "200": {
            "description": "successful operation",
            "content": {}
          },
          "400": {
            "description": "Invalid status value"
          }
        }
      }
    }
  }
}
 */

app.get("/farmacias", (req, res) => {
    mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'medicalsearch' })
        .then(conn => conn.query('SELECT * from farmacias'))
        .then(([rows, fields]) => res.json(rows));
});

app.get("/farmacias/:id", (req, res) => {
    mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'medicalsearch' })
        .then(conn => conn.query('SELECT * from farmacias where IdFarmacia = '+req.params.id))
        .then(([rows, fields]) => res.json(rows));
});

app.delete("/medicamentos", (req, res) => {
    mysql.createConnection({host:'localhost', user:'root', password:'', database:'medicalsearch'})
        .then(conn => conn.query('DELETE FROM medicamentos WHERE IdMedicamento = '+req.query.id))
        .then(([rows, fields]) => {
            if (rows.affectedRows) {
                res.json({Mensaje:"Registros borrados"});
            }else{
                res.json({Mensaje:"Nada se borro"})
            }
        })
});

app.post("/medicamentos", (req, res) => {
    const Nombre = req.body['Nombre'];
    const Precio = req.body['Precio'];
    const IdSucursal = req.body['IdSucursal'];
    const Tipo = req.body['Tipo'];
    const Existencias = req.body['Existencias'];

    // Verificar que los campos requeridos estén presentes
    if (!Nombre || !Precio || !IdSucursal || !Tipo || Existencias === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Verificar que Existencias sea un número válido
    if (isNaN(Existencias)) {
        return res.status(400).json({ error: "Existencias debe ser un número válido." });
    }

    // Conectar a la base de datos y realizar la inserción
    mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'medicalsearch' })
        .then(conn => conn.query("INSERT INTO Medicamentos (IdSucursal, Nombre, Precio, Existencias, Tipo) VALUES (?,?,?,?,?)", [IdSucursal, Nombre, Precio, Existencias, Tipo]))
        .then(([rows, fields]) => {
            if (rows.affectedRows) {
                res.status(201).json({message : "Medicamento agregado con exito"});
            } else {
                res.status(500).json({error : "No se pudo agregar el medicamento"});
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor." });
        });
});

app.post("/medicamentosUrlEncode", (req, res) => {
    const Nombre = req.body['Nombre'];
    const Precio = req.body['Precio'];
    const IdSucursal = req.body['IdSucursal'];
    const Tipo = req.body['Tipo'];
    const Existencias = req.body['Existencias'];

    // Verificar que los campos requeridos estén presentes
    if (!Nombre || !Precio || !IdSucursal || !Tipo || Existencias === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Verificar que Existencias sea un número válido
    if (isNaN(Existencias)) {
        return res.status(400).json({ error: "Existencias debe ser un número válido." });
    }

    // Conectar a la base de datos y realizar la inserción
    mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'medicalsearch' })
        .then(conn => conn.query("INSERT INTO Medicamentos (IdSucursal, Nombre, Precio, Existencias, Tipo) VALUES (?,?,?,?,?)", [IdSucursal, Nombre, Precio, Existencias, Tipo]))
        .then(([rows, fields]) => {
            if (rows.affectedRows) {
                res.status(201).json({message : "Medicamento agregado con exito"});
            } else {
                res.status(500).json({error : "No se pudo agregar el medicamento"});
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor." });
        });
});

app.patch("/medicamentos", (req,res) => {
    result = req.body;
    var query = 'UPDATE medicamentos SET ';
    var where = " WHERE IdMedicamento = "+req.query.id;
    var values = '';
    Object.keys(result).forEach(element => {
        if (!Number.isInteger(result[element])) {
            values = values + element + ' = "' + result[element] + '", ';
        }else{
            values = values + element + ' = ' + result[element] + ', ';
        }
        
    })
    console.log(values);
    query = query + values.substring(0 , values.length -2) + where;
    mysql.createConnection({host:'localhost', user:'root', password:'', database:'medicalsearch'})
        .then(conn => conn.query(query))
        .then(([rows, fields]) => {
            if (rows.affectedRows) {
                res.json({Mensaje:"Registros actualizados"});
            }else{
                res.json({Mensaje:"Nada se actualizo"})
            }
        })
})

app.post("/ServidorExpress",(req,res)=>
{res.send("Servidor express contestando a peticion GET")
});

app.listen(8080,(req,res)=>{
    console.log("Servidor express escuchando")
});

app.post("/medicamentosMultipart",upload.none,(req, res) => {
    const Nombre = req.body['Nombre'];
    const Precio = req.body['Precio'];
    const IdSucursal = req.body['IdSucursal'];
    const Tipo = req.body['Tipo'];
    const Existencias = req.body['Existencias'];
    console.log(req.body);
/** 
    if (!Nombre || !Precio || !IdSucursal || !Tipo || Existencias === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    if (isNaN(Existencias)) {
        return res.status(400).json({ error: "Existencias debe ser un número válido." });
    }

    mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'medicalsearch' })
        .then(conn => conn.query("INSERT INTO Medicamentos (IdSucursal, Nombre, Precio, Existencias, Tipo) VALUES (?,?,?,?,?)", [IdSucursal, Nombre, Precio, Existencias, Tipo]))
        .then(([rows, fields]) => {
            if (rows.affectedRows) {
                res.status(201).json({message : "Medicamento agregado con exito"});
            } else {
                res.status(500).json({error : "No se pudo agregar el medicamento"});
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: "Error interno del servidor." });
        });
    **/    
});

app.use((err,req, res, next) => {
    res.status(500).send(err.message);
})