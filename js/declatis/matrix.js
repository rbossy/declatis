class Node {
	constructor() {
		this.total = 0;
		this.count = 0;
		this.transitions = new Map();
	}

	lookup(char) {
		return this.transitions.get(char);
	}

	_dig(char) {
		if (this.transitions.has(char)) {
			return this.transitions.get(char);
		}
		var result = new Node();
		this.transitions.set(char, result);
		return result;
	}

	dig(char, weight = 1) {
		var result = this._dig(char);
		this.total += weight;
		result.count += weight;
		return result;
	}

	_total(excludeEnd) {
		var result = 0;
		for (var entry of this.transitions.entries()) {
			var char = entry[0];
			if (excludeEnd && (char === Matrix.END_CHAR)) {
				continue;
			}
			if (char === Matrix.START_CHAR) {
				continue;
			}
			result += entry[1].count;
		}
		return result;
	}

	random(excludeEnd) {
		var total = this._total(excludeEnd);
		var n = Math.floor(Math.random() * total);
		for (var entry of this.transitions.entries()) {
			var char = entry[0];
			if (excludeEnd && (char === Matrix.END_CHAR)) {
				continue;
			}
			if (char == Matrix.START_CHAR) {
				continue;
			}
			var node = entry[1];
			n -= node.count;
			if (n <= 0) {
				return entry;
			}
		}
		return undefined;
	}

	toString(indent = '') {
		var result = String(this.count) + ' / ' + this.total + '\n';
		indent += '    '
		for (var entry of this.transitions.entries()) {
			result += indent + entry[0] + ': ' + entry[1].toString(indent);
		}
		return result;
	}
}

class Matrix {
	constructor(name, kmax) {
		this.name = name;
		this.kmax = kmax;
		this.trainingWords = new Map();
		this.root = new Node();
	}

	addWord(word, weight = 1) {
		if (this.trainingWords.has(word)) {
			return;
		}
		var delimitedWord = Matrix.START_CHAR + word + Matrix.END_CHAR;
		for (var start = 0; start < delimitedWord.length; ++start) {
			var end = Math.min(delimitedWord.length, start + this.kmax + 1);
			var node = this.root;
			for (var i = start; i < end; ++i) {
				node = node.dig(delimitedWord[i], weight);
			}
		}
		this.trainingWords.set(word, weight);
	}

	addWords(words, weight = 1) {
		for (var word of words.split(/\s+/)) {
			this.addWord(word, weight);
		}
	}

	addURL(address, weight = 1) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.open('GET', address, false); /* false for synchronous request */
		xmlHttp.send(null);
		if (xmlHttp.status != 200) {
			throw new Error('could not retrieve address ' + address + ', server returned: ' + xmlHttp.statusText);
		}
		this.addWords(xmlHttp.responseText, weight);
	}
}
Matrix.START_CHAR = '^';
Matrix.END_CHAR = '$';
Matrix.SEPARATOR_CHAR = Matrix.START_CHAR + Matrix.END_CHAR;
