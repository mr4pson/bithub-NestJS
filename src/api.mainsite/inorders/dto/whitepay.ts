export interface IWpCreate {
    amount: string;
    currency: string;
    external_order_id: string;
    successful_link: string;
    failure_link: string;
}

export interface IWpOrder {
    readonly id: string;
    readonly currency: string;
    readonly expected_amount: string;
    readonly received_total: string;
    readonly exchange_rate: string;
    readonly clean_exchange_rate: string;
    readonly received_currency: string;
    readonly deposited_currency: string;
    readonly value: string;
    readonly status: string;
    readonly external_order_id: string;
    readonly created_at: string;
    readonly completed_at: string;
    readonly acquiring_url: string;
    readonly is_internal: boolean;
    readonly successful_link: string;
    readonly failure_link: string;
    readonly order_number: string;
    readonly transactions: IWpTransaction[];
}

export interface IWpOrderData {
    readonly order: IWpOrder;
}

export interface IWpTransaction {
    readonly id: string;
    readonly order_id: string;
    readonly external_order_id: string;
    readonly stock_orders: any[];
    readonly currency: string;
    readonly value: string;
    readonly is_internal: boolean;
    readonly type: string;
    readonly status: string;
    readonly hash: string;
    readonly created_at: string;
    readonly completed_at: string;
}

export interface IWpEvent {
    readonly event_type: string;
    readonly order?: IWpOrder;
    readonly transaction?: IWpTransaction;
}
