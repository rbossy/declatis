class Generator {
	constructor(firstChar) {
		this.firstChar = firstChar;
	}

	generate(word) {
		throw new Error('not implemented');
	}

	add(word, char, probability, kDegradation = undefined) {
		var slot = new Slot(this, char, probability, kDegradation);
		word.add(slot);
		return slot;
	}
}

class Constant extends Generator {
	constructor(value) {
		super(value[0]);
		this.value = value;
	}

	generate(word) {
		for (var char of this.value) {
			this.add(word, char, 1);
		}
	}
}

class TrainingWord extends Generator {
	constructor(matrix) {
		super(undefined);
		this.matrix = matrix;
	}

	generate(word) {
		var trainingWords = Array(matrix.trainingWords.keys());
		var n = Math.floor(Math.random() * trainingWords.size);
		var pick = trainingWords[n];
		var probability = 1 / trainingWords.size;
		for (var char of this.value) {
			this.add(word, char, probability);
			probability = 1;
		}
	}
}

class TooManyBacktracksError extends Error {
	constructor(word, ...args) {
		super(...args);
		this.word = word;
	}
}

class Markovian extends Generator {
	constructor(matrix, k, min, max, maxBacktracks = Number.MAX_VALUE) {
		super(undefined);
		this.matrix = matrix;
		this.k = Math.min(k, matrix.kmax);
		this.min = min;
		this.max = max;
		this.maxBacktracks = maxBacktracks;
		this.lookahead = undefined;
	}

	_generateSlot(word, k, excludeEnd) {
		var node = this.matrix.root;
		for (var slot of word.last(k)) {
			node = node.lookup(slot.char);
			if (node === undefined) {
				return undefined;
			}
		}
		var pick = node.random(excludeEnd);
		if (pick === undefined) {
			return undefined;
		}
		var char = pick[0];
		var probability = pick[1].count / node.total;
		return this.add(word, char, probability, this.k - k);
	}

	generateSlot(word, excludeEnd) {
		for (var k = this.k; k >= 0; --k) {
			var slot = this._generateSlot(word, k, excludeEnd);
			if (slot !== undefined) {
				return slot;
			}
		}
		throw Error('k = 0');
	}

	generateSlots(word, n, excludeEnd) {
		for(var i = 0; i < n; ++i) {
			this.generateSlot(word, excludeEnd);
		}
	}

	generate(word) {
		this.generateSlots(word, this.min, true);
		if (this.lookahead === undefined) {
			var n = Math.floor(Math.random() * (this.max - this.min));
			this.generateSlots(word, n, this.lookahead !== Matrix.END_CHAR);
		}
		else {
			var mark = word.length;
			for (var backtrackCount = 0; backtrackCount < this.maxBacktracks; ++backtrackCount) {
				for (var i = this.min; i < this.max; ++i) {
					var slot = this.generateSlot(word, this.lookahead !== Matrix.END_CHAR);
					if (slot.char === this.lookahead) {
						word.slots.pop();
						word.slots[word.slots.length - 1].backtrackCount = backtrackCount;
						return;
					}
				}
				word.backtrack(mark);
			}
			throw new TooManyBacktracksError(word);
		}
	}
}

class Pattern {
	constructor(name) {
		this.name = name;
		this.generators = [];
	}

	_updateLookaheads() {
		var prev = Pattern.START_CHAR;
		for (var gen of this.generators) {
			prev.lookahead = gen.firstChar;
			prev = gen;
		}
		this.generators[this.generators.length-1].lookahead = Pattern.END_CHAR.firstChar;
	}

	generate() {
		this._updateLookaheads();
		var word = new Word(this);
		Pattern.START_CHAR.generate(word);
		for (var gen of this.generators) {
			gen.generate(word);
		}
		Pattern.END_CHAR.generate(word);
		return word;
	}

	addConstant(value) {
		if (value) {
			this.generators.push(new Constant(value));
		}
	}

	addMarkovian(matrix, k, min, max, maxBacktracks) {
		if ((typeof matrix) === 'string') {
			matrix = Dictionary.get(matrix).matrix;
		}
		this.generators.push(new Markovian(matrix, k, min, max, maxBacktracks));
	}
}
Pattern.START_CHAR = new Constant(Matrix.START_CHAR);
Pattern.END_CHAR = new Constant(Matrix.END_CHAR);
Pattern.SEPARATOR = new Constant(Matrix.SEPARATOR_CHAR);
