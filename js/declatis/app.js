class CallbackProxyHandler {
	static get(target, name) {
		var method = target[name];
		if (method !== undefined) {
			return method;
		}
		console.warn('patching NOOP callback ' + name);
		return target[name] = CallbackProxyHandler.NOOP;
	}

	static NOOP(...args) {
	}
}

class App {
	constructor(callbacks) {
		this.patterns = new Map();
		this.currentPattern = undefined;
		this.wordCount = 20;
		this.excludeTrainingWords = [];
		this.minMeanProbability = 0.1;
		this.maxBacktracks = 10;
		this.callback = new Proxy(callbacks, CallbackProxyHandler);
		this.noDuplicates = true;
	}

	addPattern(pattern) {
		this.patterns.set(pattern.name, pattern);
		this.currentPattern = pattern;
	}

	addDefaultPattern(matrix, k, min, max, prefix, suffix) {
		var pattern = new Pattern('default');
		pattern.addConstant(prefix);
		pattern.addMarkovian(matrix, k, min, max, this.maxBacktracks);
		pattern.addConstant(suffix);
		this.addPattern(pattern);
	}

	_isAccepted(word, wordsSofar) {
		if (word.score < this.minMeanProbability) {
			this.callback.WordRejected(word, 'low score');
			return false;
		}
		var s = word.cleanString;
		for (var m of this.excludeTrainingWords) {
			if (m.trainingWords.has(s)) {
				this.callback.WordRejected(word, 'training word', m);
				return false;
			}
		}
		for (var w of wordsSofar) {
			if (s === w.cleanString) {
				this.callback.WordRejected(word, 'duplicate');
			}
		}
		this.callback.WordAccepted(word);
		return true;
	}

	generate() {
		this.callback.GenerationStarted();
		var result = [];
		while (result.length < this.wordCount) {
			try {
				var word = this.currentPattern.generate();
			}
			catch (e) {
				if (e instanceof TooManyBacktracksError) {
					this.callback.WordRejected(e.word, 'too many backtracks');
					continue;
				}
				console.error(e);
			}
			this.callback.WordGenerated(word);
			if (this._isAccepted(word, result)) {
				result.push(word);
			}
		}
		this.callback.GenerationFinished(result);
		return result;
	}
}
