// prettier-ignore
export const ROUTE_LIST = {
    // add routes here
    'POST /upload': 'UploadController.add',
    'GET /upload/stats': 'UploadController.getStats',
    'GET /upload/:id': 'UploadController.getOne',
    'GET /upload': 'UploadController.getAll',

    'GET /cards': 'CardController.getAll',
    'GET /cards/:id/stats': 'CardController.getStatDetail',
    'GET /cards/stats': 'CardController.getStatTotal',
    // 'POST /cards/init': 'CardController.init',
};
