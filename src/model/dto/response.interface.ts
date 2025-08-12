export interface IResponse<T> {
    statusCode: number;
    error?: string;
    data?: T;
    elementsQuantity?: number; // quantity of all elements in table    
    pagesQuantity?: number; // quantity of pages in pagination    
    sum?: number;
}
