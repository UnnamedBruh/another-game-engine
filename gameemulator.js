	class CPU {
		exec(instructions = new Uint8Array([0]), noHalt = false) {
			let i = 0, run = true;
			let accumulators = new Uint16Array([0, 0, 0, 0]), accumulatorTarget = 0, accumulatorNames = ["A", "B", "C", "D"], status = 0;
			function debug() {
				console.warn("The error was found at instruction " + i);
			}
			while (run) {
				switch (instructions[i]) {
					case 1:
						i++;
						accumulatorTarget = instructions[i];
						if (accumulatorTarget > 3) {
							if (noHalt) {
								console.warn("/!\\ A non-existent accumulator was requested for being set, so the default accumulator (Accumulator A) will be requested.");
								accumulatorTarget = 0;
							} else {
								console.warn("(x) SyntaxError: A non-existent accumulator was requested for being set.");
								debug();
								run = false;
								return 1;
							}
						}
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
								accumulators[accumulatorTarget] = accumulators[instructions[i < 3 ? i : (function() {
									if (noHalt) {
										console.warn("/!\\ A non-existent accumulator was referenced for setting Accumulator " + accumulatorNames[accumulatorTarget] + ", so the default accumulator (Accumulator A) will be referenced.");
										return 0;
									}
									console.warn("(x) A non-existent accumulator was referenced for setting Accumulator " + accumulatorNames[accumulatorTarget]);
									debug();
									run = false, status = 1;
									return 0;
								})()]];
								break
						}
						break;
					case undefined:
						console.warn("/!\\ An instruction was encountered out-of-bounds, so the program has been halted to prevent serious consequences.");
					case 0:
						run = false;
						break;
				}
				i++;
			}
			return status;
		}
	}
