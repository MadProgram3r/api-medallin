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

const PORT = process.env.PORT || 8080;
const DBHOST = process.env.MYSQLHOST || 'localhost';
const PWD = process.env.PWD || '';
const DB = process.env.DB || 'medicalsearch';
const USER =  'root';
const DBPORT = process.env.MYSQLPORT || '3306';

const mySQLConnection = { host: DBHOST, user: USER, password: 'DG1hD433dBAEhe5hF-Ea6Gf1H1bh1CGC', database: DB, port:DBPORT};

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

/**
 * @swagger
{
  "openapi": "3.0.1",
  "info": {
    "title": "Farmacias API",
    "description": "API para consultar información de farmacias",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:8080/",
    },
    {
      "url":"https://api-medallin-production.up.railway.app/"
    }
  ],
  "paths": {
    "/medicamento-update/": {
      "patch": {
        "tags": [
          "medicamentos"
        ],
        "summary": "Update Medicamentos",
        "description": "Actualizar información de medicamentos",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "ID del medicamento a actualizar",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "description": "Parámetros indefinidos en el body",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "additionalProperties": true
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Operación exitosa",
            "content": {}
          },
          "400": {
            "description": "Valor de estado no válido",
            "content": {}
          }
        },
        "x-codegen-request-body-name": "body"
      }
    },
    "/medicamento-post/": {
      "post": {
        "tags": [
          "medicamentos"
        ],
        "summary": "Crear Medicamentos",
        "description": "Crear nuevos medicamentos",
        "requestBody": {
          "description": "Datos del medicamento a crear",
          "content": {
            "application/json": {
              "schema": {
                "required": [
                  "Existencias",
                  "IdSucursal",
                  "Nombre",
                  "Precio",
                  "Tipo"
                ],
                "type": "object",
                "properties": {
                  "Nombre": {
                    "type": "string",
                    "description": "Nombre del medicamento"
                  },
                  "Precio": {
                    "type": "number",
                    "description": "Precio del medicamento"
                  },
                  "IdSucursal": {
                    "type": "number",
                    "description": "ID de la sucursal"
                  },
                  "Tipo": {
                    "type": "string",
                    "description": "Tipo del medicamento"
                  },
                  "Existencias": {
                    "type": "integer",
                    "description": "Cantidad de existencias"
                  }
                }
              }
            }
          },
          "required": true
        },
        "responses": {
          "200": {
            "description": "Operación exitosa",
            "content": {}
          },
          "400": {
            "description": "Valor de estado no válido",
            "content": {}
          }
        },
        "x-codegen-request-body-name": "body"
      }
    },
    "/medicamento-delete/": {
      "delete": {
        "tags": [
          "medicamentos"
        ],
        "summary": "Delete Medicamentos",
        "description": "Eliminar un medicamento",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "ID del medicamento a eliminar",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Operación exitosa",
            "content": {}
          },
          "400": {
            "description": "Valor de estado no válido",
            "content": {}
          }
        }
      }
    },
    "/medicamento-get/": {
      "get": {
        "tags": [
          "medicamentos"
        ],
        "summary": "Get Medicamento",
        "description": "Buscar un medicamento",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "description": "ID del medicamento a buscar",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Operación exitosa",
            "content": {}
          },
          "400": {
            "description": "Valor de estado no válido",
            "content": {}
          }
        }
      }
    },
    "/farmacias/": {
      "get": {
        "tags": [
          "farmacias"
        ],
        "summary": "Consultar las farmacias",
        "description": "Traer todas las farmacias",
        "responses": {
          "200": {
            "description": "Operación exitosa",
            "content": {}
          },
          "400": {
            "description": "Valor de estado no válido",
            "content": {}
          }
        }
      }
    }
  },
  "components": {},
  "x-original-swagger-version": "2.0"
}
 */

app.get("/farmacias", (req, res) => {
    mysql.createConnection(mySQLConnection)
        .then(conn => conn.query('SELECT * from farmacias'))
        .then(([rows, fields]) => res.json(rows));
});

app.get("/farmacias/:id", (req, res) => {
    mysql.createConnection(mySQLConnection)
        .then(conn => conn.query('SELECT * from farmacias where IdFarmacia = '+req.params.id))
        .then(([rows, fields]) => res.json(rows));
});

app.get("/medicamento-get", (req, res) => {
    mysql.createConnection(mySQLConnection)
        .then(conn => conn.query('SELECT * FROM medicamentos WHERE IdMedicamento = '+req.query.id))
        .then(([rows, fields]) => res.json(rows));
});

app.delete("/medicamento-delete", (req, res) => {
    mysql.createConnection(mySQLConnection)
        .then(conn => conn.query('DELETE FROM medicamentos WHERE IdMedicamento = '+req.query.id))
        .then(([rows, fields]) => {
            if (rows.affectedRows) {
                res.json({Mensaje:"Registros borrados"});
            }else{
                res.json({Mensaje:"Nada se borro"})
            }
        })
});

app.post("/medicamento-post", (req, res) => {
    const Nombre = req.body['Nombre'];
    const Precio = req.body['Precio'];
    const IdSucursal = req.body['IdSucursal'];
    const Tipo = req.body['Tipo'];
    const Existencias = req.body['Existencias'];

    console.log(req)

    // Verificar que los campos requeridos estén presentes
    if (!Nombre || !Precio || !IdSucursal || !Tipo || !Existencias === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Verificar que Existencias sea un número válido
    if (isNaN(Existencias)) {
        return res.status(400).json({ error: "Existencias debe ser un número válido." });
    }

    // Conectar a la base de datos y realizar la inserción
    mysql.createConnection(mySQLConnection)
        .then(conn => conn.query("INSERT INTO medicamentos (IdSucursal, Nombre, Precio, Existencias, Tipo) VALUES (?,?,?,?,?)", [IdSucursal, Nombre, Precio, Existencias, Tipo]))
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
    mysql.createConnection(mySQLConnection)
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



app.patch("/medicamento-update", (req,res) => {
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
    mysql.createConnection(mySQLConnection)
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

app.listen(PORT,(req,res)=>{
    console.log(mySQLConnection);
    console.log("Servidor express escuchando en "+PORT)
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

    mysql.createConnection(mySQLConnection)
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