// prettier-ignore
export const ROUTE_LIST = {
    // add routes here
    'POST /upload': 'UploadController.add',
    'GET /upload/:id': 'UploadController.getOne',

    'GET /cards': 'CardController.getAll',
    'POST /cards/init': 'CardController.init',
};
