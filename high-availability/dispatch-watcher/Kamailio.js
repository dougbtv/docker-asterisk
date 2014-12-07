module.exports = function(log,opts) {

	/*

	// boxen example
	
	var thing = {
		box1: {
			ip: 192.168.1.100,
			weight: 15,
			port: 5060
			heartbeat: {uuid}
		},
		box2: {
			ip: 192.168.1.101,
			heartbeat: {uuid}
		}
	}

	*/

	var validateBoxen = function(boxen,callback) {

		// Let's collect just valid boxes.
		var valid = {};

		// Ok, let's cycle all the boxes.
		for (var boxkey in boxen){
			if (boxen.hasOwnProperty(boxkey)) {
				var box = boxen[boxkey];
				console.log("!trace each boxen: ",box);
				if (box.ip && box.heartbeat) {

					// That seems good!
					valid[boxkey] = box;

				} else {
					// Invalid box.
					log.warn("kama_box_notready",{ box: boxkey, boxfull: box });
				}
			}
		}

		callback(valid);

	}

	var setWeights = function(boxes,callback) {

		// So, now we have all the valid boxes.
		// We need to figure out the weights.
		// That being said:
		//  - count the number of boxes.
		//  - see which have weights.
		//  - set the weights for the specific boxes.
		//  - spread the rest out between the unspecified
		//  - figure out what to do with the remainder.
		
		var number_boxes = 0;
		var weights = {};
		var number_weighted = 0;
		var total_weight = 0;

		for (var boxkey in boxes){
			if (boxes.hasOwnProperty(boxkey)) {

				var box = boxes[boxkey];

				// Count number of boxes.
				number_boxes++;

				// Mark each box that has a weight.
				if (box.weight) {
					number_weighted++;
					weights[boxkey] = parseInt(box.weight);
					total_weight = total_weight + weights[boxkey];
				}

			}
		}

		console.log("!trace number boxes: ",number_boxes);
		console.log("!trace weights: ",weights);

		// How many are unweighted?
		var number_unweighted = number_boxes - number_weighted;

		// How much percent do we split?
		var split_percent = 100 - total_weight;

		// Ok, this is the remainder we'll add to the first box.
		var add_to_first = 0;

		// What's the split for each unweighted box?
		var each_split;



		// We split that between unweighted boxes.
		if (!number_unweighted) {
			// That's a divide by zero problem.
			// All boxes must be weighted in this case.
			// We have to give the remainder to the first box.
			add_to_first = total_weight;

			log.warn("no_unweighted",{ number_weighted: number_weighted});

		} else {

			// Ok, we can split that percent among all the boxes.
			// Let's floor each split.
			each_split = Math.floor(split_percent / number_unweighted);

			// Now we can figure out our remainder.
			var sum_unweight = (number_unweighted * each_split);
			var sum_all_weights = (sum_unweight + total_weight);

			add_to_first = 100 - sum_all_weights;

			// Let's log the remainder.
			log.it("distribution_calculated",{
				number_weighted: number_weighted,
				number_unweighted: number_unweighted,
				each_split: each_split,
				remainder: add_to_first,
				sum_unweight: sum_unweight,
				sum_all_weights: sum_all_weights,
			});


		}

		// Now we apply 
		for (var boxkey in boxes){
			if (boxes.hasOwnProperty(boxkey)) {
				var box = boxes[boxkey];

				// Assign the appropriate weight.
				// if specific weight...
				if (box.weight) {
					boxes[boxkey].calculated_weight = weights[boxkey];
				} else {
					// Distributed weight.
					boxes[boxkey].calculated_weight = each_split;
				}

				// Add any remainder weight to the first unweighted box.
				if (add_to_first && !box.weight) {
					boxes[boxkey].calculated_weight = boxes[boxkey].calculated_weight + add_to_first;
					add_to_first = false;
				}
			}
		}

		callback(boxes);

	}

	this.createList = function(boxen,callback) {

		validateBoxen(boxen,function(boxes){

			log.it("boxes_for_createlist",{boxes: boxes});
			
			setWeights(boxes,function(weightedboxes){

				log.it("weighted_boxes_result",{boxes: weightedboxes});

			});
			

		});

		callback(null);

	}

}