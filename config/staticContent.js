var { AppController } = require('./appController');
var StaticContent = require('../../models/staticContents');
const constants = require('../../config/constants');

/**
 * Static Contents
 * It's contains all the opration related with static contents table. Like staticContentsList, 
 * staticContentsDetails, updateStaticContents, deleteStaticContents
 */
class StaticContents extends AppController {
	constructor() {
		super();
	}

	/**
	 * Get Static Contents List
	 * Used for get all the static contents list with pagination
	 * 
	 * @param {*} req It's contains all the parameters like q for search etc...
	 * @param {*} res 
	 * 
	 * @returns object It's contains status_code, message and userdata
	 */
	async getStaticContentsList(req, res) {
		try {
			var allstaticContents = await StaticContent.query()
				.andWhere('type', 'static-pages')
				.select([
					'id',
					'slug',
					'title',
					'type',
					'updated'
				])
				.orderBy('id', 'ASC')
				.throwIfNotFound();

			res.json({
				"status": constants.success_code,
				"message": constants.static_content_listed_success,
				"data": allstaticContents
			});
			return;
		} catch (err) {
			if (err instanceof StaticContent.NotFoundError) {
				// Check static content not found and return a responce for the same
				res.json({
					"status": constants.success_code,
					"message": constants.no_static_content_found,
					"data": []
				});
				return;
			}

			res.json({
				"status": constants.server_error_code,
				"message": constants.server_error,
			});
			return;
		}
	}

	/**
	 * Get Static Content Details
	 * Used for get single static page details
	 * 
	 * @param {*} req It's contains encripted static content id
	 * @param {*} res 
	 * 
	 * @returns object It's contains status_code, message and userdata
	 */
	async getStaticContentDetails(req, res) {
		try {
			var id = StaticContent.decript_id(req.params.id);

			var userDetails = await StaticContent.query()
				.select([
					'id',
					'slug',
					'title',
					'type',
					'value'
				])
				.andWhere('type', 'static-pages')
				.andWhere('id', id)
				.first()
				.throwIfNotFound();

			res.json({
				"status": constants.success_code,
				"message": constants.static_content_details_success,
				"data": userDetails
			});
			return;
		} catch (err) {
			if (err instanceof StaticContent.NotFoundError) {
				// Check user not found and return a responce for the same
				res.json({
					"status": constants.server_error_code,
					"message": constants.no_static_content_found,
					"data": []
				});
				return;
			}

			res.json({
				"status": constants.server_error_code,
				"message": constants.server_error,
			});
			return;
		}
	}

	/**
	 * Update Static Contents
	 * Used for update static contents's details
	 * 
	 * @param {*} req It's contaisn title and value
	 * @param {*} res *
	 * 
	 * @returns object It's contains status_code, message and userdata
	 */
	async updateStaticContents(req, res) {
		try {
			var id = StaticContent.decript_id(req.params.id);
			var requestData = req.body;

			const staticContainDetails = await StaticContent
				.query()
				.findById(id)
				.throwIfNotFound()
				.first()

			await staticContainDetails
				.$query()
				.patch({
					'title': requestData.title,
					'value': requestData.value,
					'admin_id': req.session.user_id
				});

			if (staticContainDetails instanceof StaticContent) {
				res.json({
					"status": constants.success_code,
					"message": constants.static_content_updated_success,
				});
				return;
			}

			res.json({
				"status": constants.server_error_code,
				"message": constants.server_error,
			});
			return;
		} catch (err) {
			if (err instanceof StaticContent.ValidationError) {
				// Check static contents validation error and send validation error
				res.json({
					"status": constants.server_error_code,
					"message": constants.server_error,
					"error": err.data
				});
				return;
			} else if (err instanceof StaticContent.NotFoundError) {

				// Check user not found and return a responce for the same
				res.json({
					"status": constants.success_code,
					"message": constants.no_static_content_found
				});
				return;
			}

			res.json({
				"status": constants.server_error_code,
				"message": constants.server_error
			});
		}
	}
}

module.exports = new StaticContents();
