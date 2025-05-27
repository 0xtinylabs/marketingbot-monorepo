class WithdrawDTO {
    public to_wallet_address: string
    public token_address: string
    public type: "NATIVE" | "TOKEN"
}
export default WithdrawDTO