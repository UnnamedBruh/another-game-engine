var EMULATOR = (function() {
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
			let accumulators = new Uint16Array([0, 0, 0, 0]), accumulatorTarget = 0, accumulatorNames = "ABCD", status = 0;
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
						if (accumulatorTarget > 3) {
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
								accumulators[accumulatorTarget] = accumulators[instructions[i < 4 ? i : unknownAccumulator()]];
								break;
							case 3:
								i++;
								accumulators[accumulatorTarget] = this.memory[instructions[i]];
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
								accumulators[accumulatorTarget] += accumulators[instructions[i < 4 ? i : unknownAccumulator()]];
								break;
							case 3:
								i++;
								accumulators[accumulatorTarget] = this.memory[instructions[i]];
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
								this.memory[memorySelect] = accumulators[instructions[i < 4 ? i : unknownAccumulator()]];
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
	}
	
})();
