export interface INowPaymentsPayment {
  id: string;
  token_id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  pay_currency: string | null;
  ipn_callback_url: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  customer_email: string | null;
  partially_paid_url: string | null;
  payout_currency: string | null;
  created_at: string;
  updated_at: string;
  is_fixed_rate: boolean;
  is_fee_paid_by_user: boolean;
  source: string | null;
  collect_user_data: boolean;
}
