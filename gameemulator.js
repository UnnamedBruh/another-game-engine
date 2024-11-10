var EMULATOR = (function(canvas) {
	const children = [];
	const CPUDefaultMemory = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	class CPU {
		constructor() {
			this.memory = Uint16Array.from(CPUDefaultMemory); // Make sure 256 digits of memory can be used
		}
		exec(instructions = new Uint8Array([0]), noHalt = false) {
			/* Error Codes:
   				0: While not an error code, the program ran successfully
				1: An unknown accumulator was referenced/requested
	   			2: An unknown instruction was encountered
				3: An out-of-bounds instruction was encountered
   			*/
			/*
   				0: The program completely ends (no additional steps)
				1: The program selects which accumulator would be requested for their value to be set
				2: The program sets the selected accumulator's value to either an 8-bit integer (next instruction 0),
	16-bit integer (next instruction 1), an accumulator value (next instruction 2), or one of the CPU's memory (next instruction 3)
				3: The program adds the selected accumulator's value by either an 8-bit integer (next instruction 0),
	16-bit integer (next instruction 1), an accumulator value (next instruction 2), or one of the CPU's memory (next instruction 3)
				4: The memory is cleared entirely
				5: The program sets a memory digit value to either an 8-bit integer (next instruction 0), 16-bit integer (next instruction 1),
	an accumulator value (next instruction 2), or one of the CPU's memory (next instruction 3)
			*/
			if (this.memory.length !== 256 || !(this.memory instanceof Uint16Array)) throw new TypeError("The 'memory' property does not consist of 256 unsigned 16-bit integers! It has to only include 16-bit unsigned integers for the instructions to be fully executed.");
			let i = 0, run = true, memClear = true;
			let accumulators = new Uint16Array([0, 0, 0, 0, 0, 0, 0, 0]), accumulatorTarget = 0, accumulatorNames = "ABCDEFGH", status = 0;
			let accStrings = ["", "", "", "", "", "", "", ""];
			function debug() {
				console.warn("The error was found at instruction " + i);
			}
			function unknownAccumulator() {
				if (noHalt) {
					console.warn("/!\\ A non-existent accumulator was referenced for setting Accumulator " + accumulatorNames[accumulatorTarget] + "; the default accumulator (Accumulator A) will be referenced.");
					return 0;
				}
				console.warn("(x) SyntaxError: A non-existent accumulator was referenced for setting Accumulator " + accumulatorNames[accumulatorTarget]);
				debug();
				run = false, status = 1;
				return 0;
			}
			while (run) {
				switch (instructions[i]) {
					case 1:
						i++;
						accumulatorTarget = instructions[i];
						if (accumulatorTarget > 7) {
							if (noHalt) {
								console.warn("/!\\ A non-existent accumulator was requested for being set; the default accumulator (Accumulator A) will be requested");
								accumulatorTarget = 0;
							} else {
								console.warn("(x) SyntaxError: A non-existent accumulator was requested for being set");
								debug();
								run = false;
								return 1;
							}
						}
						break;
					case 2:
						i++;
						switch (instructions[i]) {
							case 0:
								i++;
								accumulators[accumulatorTarget] = instructions[i];
								break;
							case 1:
								i++;
								accumulators[accumulatorTarget] = instructions[i] + (instructions[i + 1] << 8);
								i++;
								break;
							case 2:
								i++;
								accumulators[accumulatorTarget] = accumulators[instructions[i < 8 ? i : unknownAccumulator()]];
								break;
							case 3:
								i++;
								accumulators[accumulatorTarget] = this.memory[instructions[i]];
								break;
							case 4:
								i++;
								accStrings[accumulatorTarget] = "";
								while (instructions[i] !== 0) {
									accStrings[accumulatorTarget] += String.fromCodePoint(instructions[i]);
									i++;
								}
								break;
							case 5:
								i++;
								accStrings[accumulatorTarget] = "";
								while (instructions[i] + instructions[i + 1] !== 0) {
									accStrings[accumulatorTarget] += String.fromCodePoint(instructions[i] + (256 * instructions[i + 1]));
									i += 2;
								}
								break;
						}
						break;
					case 3:
						i++;
						switch (instructions[i]) {
							case 0:
								i++;
								accumulators[accumulatorTarget] += instructions[i];
								break;
							case 1:
								i++;
								accumulators[accumulatorTarget] += instructions[i] + (instructions[i + 1] << 8);
								i++;
								break;
							case 2:
								i++;
								accumulators[accumulatorTarget] += accumulators[instructions[i < 8 ? i : unknownAccumulator()]];
								break;
							case 3:
								i++;
								accumulators[accumulatorTarget] += this.memory[instructions[i]];
								break;
							case 4:
								i++;
								while (instructions[i] !== 0) {
									accStrings[accumulatorTarget] += String.fromCodePoint(instructions[i]);
									i++;
								}
								break;
							case 5:
								i++;
								while (instructions[i] + instructions[i + 1] !== 0) {
									accStrings[accumulatorTarget] += String.fromCodePoint(instructions[i] + (256 * instructions[i + 1]));
									i += 2;
								}
								break;
						}
						break;
					case 4:
						if (memClear) {
							this.memory.fill(0);
							memClear = false;
						}
						break;
					case 5:
						i++;
						const memorySelect = instructions[i];
						const prevMem = this.memory[memorySelect];
						i++;
						switch (instructions[i]) {
							case 0:
								i++;
								this.memory[memorySelect] = instructions[i];
								break;
							case 1:
								i++;
								this.memory[memorySelect] = instructions[i] + (instructions[i + 1] << 8);
								i++;
								break;
							case 2:
								i++;
								this.memory[memorySelect] = accumulators[instructions[i < 8 ? i : unknownAccumulator()]];
								break;
							case 3:
								i++;
								this.memory[memorySelect] = this.memory[instructions[i]];
								break;
						}
						memClear = memClear || prevMem !== this.memory[memorySelect];
						break;
					case undefined:
						console.warn("(x) An instruction was encountered out-of-bounds, so the program has been halted to prevent serious consequences");
						run = false;
						return 3;
					case 0:
						run = false;
						break;
					default:
						if (noHalt) {
							console.warn("/!\\ An unknown instruction was encountered (instruction is " + instructions[i] + "), but that instruction will be ignored");
						} else {
							console.warn("(x) SyntaxError: An unknown instruction was encountered (instruction is " + instructions[i] + ")");
							run = false;
							return 2;
						}
				}
				i++;
			}
			return status;
		}
		compile(code) {
			if (typeof code !== "string") return;
			const regex = /\[[A-Z0-9]+\]|\<[A-Z_]+\>|"[^"]*"|\w+|-?\d+(\.\d*)?|[\n;](?:[\n;]*)|[^ \t]/gms;
			const tokens = code.match(regex);
			const len = tokens.length, arr = [], types = {UINT8: 0, UINT16: 1, UTF8STRING: 4, UTF16STRING: 5};
			let i = 0, currentAccumulator = 0, accumulators = 0, token;
			let vars = {}, existingVars = [];
			function handleType(type, literal) {
				const result = [];
				let num = 0;
				switch (type) {
					case "UINT8":
						result.push(Math.floor(+literal) % 256);
						break;
					case "UINT16":
						num = +literal;
						result.push(Math.floor(num) % 256, (num << 8) % 256);
						break;
					case "UTF8STRING":
						num = literal.slice(1, -1);
						const len = num.length;
						let char = 0;
						for (let i = 0; i < len; i++) {
							char = num.codePointAt(i);
							if (char > 255) throw new TypeError("COMPILATION:\n(x) [UTF8STRING]s must have characters with their code points less than 255!");
							if (char === 0) {
								result.push(char);
								console.warn("COMPILATION:\n/!\\ It is not recommended to include any nullish characters in any [STRING] type! Doing so can lead to security vulnerabilities, and confusion with string literals!");
								return result;
							}
							result.push(char);
						}
						result.push(0);
						break;
					case "UTF16STRING":
						num = literal.slice(1, -1);
						const len2 = num.length;
						let char2 = 0;
						for (let i = 0; i < len2; i++) {
							char2 = num.codePointAt(i);
							if (char2 === 0) {
								result.push(char2, char2);
								console.warn("COMPILATION:\n/!\\ It is not recommended to include any nullish characters in any [STRING] type! Doing so can lead to security vulnerabilities, and confusion with string literals!");
								return result;
							}
							result.push(char2 % 256, char2 << 8);
						}
						result.push(0, 0);
						break;
				}
				return result;
			}
			function newIdentifier(id) {
				if (existingVars.includes(id)) {
					return vars[id];
				}
				vars[id] = accumulators;
				existingVars.push(id);
				return accumulators++;
			}
			for (; i < len; i++) {
				token = tokens[i];
				switch (token) {
					case "SET":
						i++;
						if (/[^A-Za-z_]/.test(tokens[i])) {
							throw new SyntaxError("COMPILATION:\n(x) Unexpected token '" + tokens[i] + "'");
						}
						let old = currentAccumulator;
						currentAccumulator = newIdentifier(tokens[i]);
						if (accumulators > 7) throw new Error("COMPILATION:\n(x) Only 8 variables can be defined. The compiler may handle this case in the future");
						if (old !== currentAccumulator) {
							arr.push(1, currentAccumulator);
						}
						i++;
						old = tokens[i].slice(1, -1);
						i++;
						arr.push(types[old], ...handleType(old, tokens[i]));
				}
			}
			arr.push(0);
			return Uint8Array.from(arr);
		}
	}
	return CPU;
})();
