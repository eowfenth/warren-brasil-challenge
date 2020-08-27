export interface Base {
    id: string;
}

export interface User extends Base {
    first_name: string;
    last_name: string;
    email: string;
    document_id: string;
    password_hash: string;
    birthdate: Date;
}

export interface Wallet extends Base {
    balance: number;
    user_id: string;
}

export interface Transaction extends Base {
    type: 'withdraw' | 'deposit' | 'transfer_deposit' | 'transfer_withdraw';
    wallet_id: string;
    user_id: string;
    amount: number;
}
