package contract

type PostTokenRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type PostTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}
