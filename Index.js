const express = require('express');
const app = express();
const port = process.env.port || 5000;
const cors = require('cors');
const bodyParser = require('body-parser');

const mysql = require('mysql');
const connection = mysql.createConnection({
	database: 'cadastroprodutos',
	host: 'localhost',
	user: 'root',
	password: 'teadoro123',
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connection.connect();

app.get('/validades', (req, res) => {
	connection.query(
		`SELECT DATE_FORMAT(validadeFinal, '%m/%Y') as validadeMesAno FROM validades GROUP BY DATE_FORMAT(validadeFinal, '%m/%Y') ORDER BY DATE_FORMAT(validadeFinal, '%m/%Y') DESC`,
		(err, result) => {
			if (!err) {
				console.log(result);
				res.json(result);
			}
		}
	);
});

app.get('/consultaValidades/:mes/:ano', (req, res) => {
	let { mes, ano } = req.params;

	connection.query(
		`SELECT *, DATE_FORMAT(validadeFinal, '%Y/%m/%d') as validadeFinal, DATE_FORMAT(validadeFinal, '%d/%m/%Y') as validadeFinalBr,DATE_FORMAT(validadeFinal, '%d/%m') as validadeFinalBrSemAno, DATE_FORMAT(finalizadoData, '%d/%m') as finalizadoDataSemAno FROM validades WHERE DATE_FORMAT(validadeFinal,'%m/%Y') = '${mes}/${ano}' ORDER BY validadeFinal ASC`,
		(err, result) => {
			if (!err) {
				//console.log(result);
				return res.json(result);
			}
		}
	);
});

app.get('/consultaValidadesBuscar/:busca/:mes/:ano', (req, res) => {
	let { busca, mes, ano } = req.params;

	connection.query(
		`SELECT *, DATE_FORMAT(validadeFinal, '%Y/%m/%d') as validadeFinal, DATE_FORMAT(validadeFinal, '%d/%m/%Y') as validadeFinalBr,DATE_FORMAT(validadeFinal, '%d/%m') as validadeFinalBrSemAno, DATE_FORMAT(finalizadoData, '%d/%m') as finalizadoDataSemAno FROM validades WHERE DATE_FORMAT(validadeFinal,'%m/%Y') = '${mes}/${ano}' AND nomeProduto LIKE '%${busca}%' OR codigoBarra LIKE '%${busca}%' ORDER BY validadeFinal ASC`,
		(err, result) => {
			if (!err) {
				//console.log(result);
				return res.json(result);
			}
		}
	);
});

app.get('/consultaValidadesBuscarTodas/:busca', (req, res) => {
	let { busca } = req.params;

	connection.query(
		`SELECT *, DATE_FORMAT(validadeFinal, '%Y/%m/%d') as validadeFinal, DATE_FORMAT(validadeFinal, '%d/%m/%Y') as validadeFinalBr,DATE_FORMAT(validadeFinal, '%d/%m') as validadeFinalBrSemAno, DATE_FORMAT(finalizadoData, '%d/%m') as finalizadoDataSemAno FROM validades WHERE nomeProduto LIKE '%${busca}%' OR codigoBarra LIKE '%${busca}%' ORDER BY validadeFinal ASC`,
		(err, result) => {
			if (!err) {
				//console.log(result);
				return res.json(result);
			}
		}
	);
});

app.post('/finalizarValidade', (req, res) => {
	let { id, finalizado, dataFinalizacao } = req.body;
	//console.log(req.body);

	if (finalizado === 0) {
		dataFinalizacao = '';
	}

	connection.query(
		`UPDATE validades SET finalizado = '${finalizado}', finalizadoData = '${dataFinalizacao}' WHERE id = '${id}'`,
		(err, result) => {
			if (!err) {
				return res.json({ message: 'Status da finalização atualizado!' });
			}
			return res.json({ message: err });
		}
	);
});

app.post(`/lancarSistema`, (req, res) => {
	let { id, lancado } = req.body;

	connection.query(
		`UPDATE validades SET lancadoSistema = '${lancado}' WHERE id = '${id}'`,
		(err) => {
			if (!err) {
				return res.json({ message: 'Status do lançamento atualizado!' });
			}

			return res.json({ message: 'Ocorreu um erro ao atualizar o valor.' });
		}
	);
});

app.get(
	'/lista-auto-complete/:coluna/:tabela/:buscar/:limite',
	(req, res, next) => {
		let { buscar, coluna, tabela, limite } = req.params;

		connection.query(
			`SELECT ${coluna} FROM ${tabela} WHERE ${coluna} LIKE '%${buscar}%' GROUP BY ${coluna} ORDER BY ${coluna} LIMIT ${limite}`,
			(err, result) => {
				if (err) {
					return res.send(err);
				} else {
					console.log(result);
					return res.json(result);
				}
			}
		);
	}
);

app.post('/adicionarValidade', (req, res) => {
	console.log(req.body);
	//console.log(req);
	let { descricaoProduto, coleta, quantidade, validade, codigo, lote } =
		req.body;

	//let test = JSON.parse(req.body);

	console.log(req.body);
	connection.query(
		`INSERT INTO validades (nomeProduto, dataColetaValidade, validadeFinal, codigoBarra, quantidadeProdutos, lote) VALUES ('${descricaoProduto}','${coleta}','${validade}','${codigo}','${quantidade}','${lote}')`,
		(err, result) => {
			if (!err) {
				return res.json({ message: 'Validade cadastrada!' });
			}
			return res.json({ message: err });
		}
	);
});

app.get('/teste', (req, res) => {
	connection.query('SELECT * FROM coleta', (error, results, fields) => {
		if (!error) {
			res.send(results);
		}
	});
});

app.listen(port, () => {
	console.log(`Estamos rodando na porta ${port}`);
});
