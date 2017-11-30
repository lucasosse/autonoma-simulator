function frameInfo(stateID, transitionID) {
	this.stateID = stateID;
	this.transitionID = transitionID;
}

function run() {
	var input = document.getElementById("input-word").value;
	runInfo.input = input;

	var currentState = getInitialState();
	var nextState = null;

	validateInput();

	var queue = [];

	while (input != "") {
		var current_symbol;
		current_symbol = input[0];
		queue.push(new frameInfo(currentState.id, null));

		for (var i = 0; i < currentState.transitionsOut.length; i++) {
			for (var j = 0; j < currentState.transitionsOut[i].symbols.length; j++) {
				if (currentState.transitionsOut[i].symbols[j] == current_symbol) {
					nextState = currentState.transitionsOut[i].state_dst;
					queue.push(new frameInfo(null, currentState.transitionsOut[i].id));
					break;
				}
			}
		}

		currentState = nextState;		

		input = input.substring(1, input.length);
	}

	queue.push(new frameInfo(currentState.id, null));

	runAnimation(queue);
}

function runAnimation(queue) {
	runInfo.nowRunning = true;
	runInfo.currentChar = 0;

	var timeSkipAmount = 800;
	var timeSkipCount = 0;

	var framecount = 0;
	for (var i = 0; i < queue.length; i++) {
		setTimeout(function() {
			var frame = queue[framecount];
			framecount++;

			if (frame.stateID != null) {
				runInfo.transitionID = null;
				runInfo.stateID = frame.stateID;
			}
			if (frame.transitionID != null) {
				runInfo.transitionID = frame.transitionID;
				runInfo.stateID = null;
				runInfo.currentChar++;
			}

		}, timeSkipAmount * timeSkipCount++);
	}

	setTimeout(function() {
		runInfo.nowRunning = false;
		logResult(getStateByID(queue[queue.length - 1].stateID).name, 
			getStateByID(queue[queue.length - 1].stateID).end);
	}, timeSkipAmount * timeSkipCount++);
}

function isAutomataComplete() {
	var exitSymbols = [];
	var result = true;
	var error = "";

	for (var i = 0; i < stateList.length; i++) {
		exitSymbols = alphabet.slice();

		for (var j = 0; j < stateList[i].transitionsOut.length; j++) {
			for (var k = 0; k < stateList[i].transitionsOut[j].symbols.length; k++) {
				var aux = exitSymbols.indexOf(stateList[i].transitionsOut[j].symbols[k]);
				if (aux != -1) {
					exitSymbols.splice(aux, 1);
				}
			}
		}

		if (exitSymbols.length != 0) {
			error += "state #" + stateList[i].id + " nao tem transição de saida contendo os simbolos " + exitSymbols + ".<br>";
			result = false;
		}
	}

	if (!result) {
		logError("AUTOMATO NAO COMPLETO", error);
	}
	return result;
}

function setAlphabet() {
	restart();

	var aux = document.getElementById("alphabet").value;
	aux.replace(" ", "");
	aux.replace(",", "");

	if (aux.length == 0) {
		return;
	}

	alphabet = [];
	while (aux != "") {
		var symbol = aux[0];

		if (alphabet.indexOf(symbol) != -1) {
			return;
		}

		if (symbol != "," && symbol != " ") {
			alphabet[alphabet.length] = symbol;
		}

		aux = aux.substring(1, aux.length);
	}

	$("#canvas").show();
}

function restart() {
	$("#results").html("");
	$("#error").html("");
	firstResult = true;
	start();
}

function logError(type, msg) {
	var txt = "<b>ERROR - <i>" + type + "</i></b>:<br> ";
	txt += msg;
	$("#error").html(txt);
}

var firstResult = true;

function logResult(final_state_name, accept) {
	if (firstResult) {
		firstResult = false;
		$("#results").html("<br><b>RESULTS:</b><br>");
	}

	var txt = "[input: \"<b>" + runInfo.input + "</b>\", ";
	if (accept) {
		txt += "end state: <b>" + final_state_name + "</b>] - aceito. <br><br>";
	}
	else {
		txt += "end state: <b>" + final_state_name + "</b>] - rejeitado. <br><br>";
	}

	$("#results").append(txt);
}

function validateInput() {
	var aux = $("#input-word").val();	
	var result = true;
	var incorrect_symbols = [];

	if (aux == null || aux.length == 0) {
		logError("NENHUM", "automato esta funcional.");
		result = false;
	}
	else {
		for (var i = 0; i < aux.length; i++) {
			if (alphabet.indexOf(aux.charAt(i)) == -1) {
				if (incorrect_symbols.indexOf(aux.charAt(i)) == -1) {
					incorrect_symbols.push(aux.charAt(i));
				}
			}
		}
	}

	if (incorrect_symbols.length != 0) {
		logError("ENTRADA IMPOSSIVEL", "os simbolos \'" + incorrect_symbols + "\' nao existem no alfabeto.");
		result = false;
	}

	if (getInitialState() == null) {
		logError("SEM ESTADO INICIAL", "automato nao tem um estado inicial.")
		result = false;
	}

	if (!isThereFinalState()) {
		logError("SEM ESTADO FINAL", "automato nao tem um estado final.")
		result = false;
	}

	if (alphabet == []) {
		logError("SEM ALFABETO", "alfabeto nao definido.")
		result = false;
	}

	if (!isAutomataComplete()) {
		result = false;
	}

	if (result) {
		logError("NENHUM", "automato esta funcional.");
	}

	$("#run-button").prop("disabled", !result);
	return result;
}
