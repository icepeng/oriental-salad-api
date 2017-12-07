// prettier-ignore
export const ROUTE_LIST = {
    // add routes here
    'POST /upload': 'UploadController.add',
    'POST /upload/search': 'UploadController.findByName',
    'GET /upload/stats': 'UploadController.getStats',
    'GET /upload/:id': 'UploadController.getOne',

    'GET /cards': 'CardController.getAll',
    'POST /cards/init': 'CardController.init',
};
