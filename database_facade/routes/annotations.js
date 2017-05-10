const express = require('express');
const router = express.Router();

var myAnno;

router.route('/')
	.get((request, response) => {
		// index
		if (myAnno) {
			console.log("Annotation found!");
			response.json([ myAnno ]);
		} else {
			console.log("No annotation found!");
			response.json([]);
		}
	})
	.post((request, response) => {
		// create
		myAnno = request.body;
		myAnno.id = "4711";
		response.status(303)
				.location("/annotations/" + myAnno.id)
				.end();
	});

router.route('/:id')
	.get((request, response) => {
		// read
		response.json(myAnno);
	})
	.put((request, response) => {
		// update
		myAnno = request.body;
		myAnno.id = "4711";
		response.status(303)
				.location("/annotations/" + myAnno.id)
				.end();
	})
	.delete((request, response) => {
		// delete
		myAnno = null;
		response.status(204)
				.end();
	});

module.exports = router;
