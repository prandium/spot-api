module.exports = function (apiRoutes, CreateRole, GetAll) {
	apiRoutes.post("/roles/add", CreateRole);
	apiRoutes.get("/roles/getAll", GetAll);
};