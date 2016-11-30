import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import ButtonCustomizado from './componentes/ButtonCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {
	constructor() {
		super();
		this.state = { titulo:'', autorId:'', preco:'' };
		this.enviaForm = this.enviaForm.bind(this);
		this.setTitulo = this.setTitulo.bind(this);
		this.setAutorId = this.setAutorId.bind(this);
		this.setPreco = this.setPreco.bind(this);
	}

	enviaForm(evento) {
		evento.preventDefault();

		$.ajax({
			url:"http://localhost:8080/api/autores",
			contentType: "application/json",
			dataType: "json",
			type: "post",
			data: JSON.stringify({ titulo: this.state.titulo, autorId: this.state.autorId, preco: this.state.preco }),
			success: function(novaListagem){    
				PubSub.publish('atualiza-lista-livros', novaListagem);
				this.setState({titulo: '', autorId: '', preco: ''});
			}.bind(this),
			error: function(e) {
				if (e.status === 400) {
					new TratadorErros().publicaErros(e.responseJSON);
				}
			},
			beforeSend: function() {
				PubSub.publish("limpa-erros", {});
			}
		});
	}

	setTitulo(evento) {
		this.setState({titulo: evento.target.value});
	}

	setAutorId(evento) {
		this.setState({autorId: evento.target.value});
	}

	setPreco(evento) {
		this.setState({preco: evento.target.value});
	}

	render() {
		return (
			<div className="pure-form pure-form-aligned">
				<form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
					<InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome} label="Nome"/>
					<InputCustomizado id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail} label="Email" />
					<InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha} label="Senha"/>
					<ButtonCustomizado type="submit" text="Gravar"/>
				</form>
			</div>
		);
	}
}

class TabelaLivros extends Component {
	render() {
		return (
			<div>
          		<table className="pure-table">
            		<thead>
              			<tr>
                    		<th>Título</th>
                    		<th>Autor</th>
                    		<th>Preço</th>
                  		</tr>
                	</thead>
                	<tbody>
                  	{
                    	this.props.lista.map(function (obj) {
                      		return (
                        		<tr key={obj.id}>
                          			<td>{obj.titulo}</td>
                          			<td>{obj.autor}</td>
                          			<td>{obj.preco}</td>
                        		</tr>
                      		);
                    	})
                  	}
                	</tbody>
              	</table>
            </div>
		);
	}
}

export default class LivroBox extends Component {
	constructor() {
		super();
		this.state = { lista : [] };
	}

	componentDidMount() {
		$.ajax({
			url:"http://localhost:8080/api/livros",
			dataType: "json",
			success:function(resposta){    
				this.setState({lista:resposta});
			}.bind(this)
		});

		PubSub.subscribe('atualiza-lista-livros', function(topico, novaListagem) {
			this.setState({lista:novaListagem});
		}.bind(this));
	}

	render() {
		return (
			<div>
				<div className="header">
		        	<h1>Cadastro de Livros</h1>
		        </div>
				<div className="content" id="content">
					<FormularioLivro/>
					<TabelaLivros lista={this.state.lista}/>
				</div>
			</div>
		);
	}
}