import PubSub from 'pubsub-js';

export default class TratadorErros {
	publicaErros(errorResponse) {
		for (var i = 0; i < errorResponse.errors.length; i++) {
			var erro = errorResponse.errors[i];
			PubSub.publish("erro-validacao", erro);
		}
	}
}