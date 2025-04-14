package contract

type UsersRolesAvailables []string
type GetMeResponse GetUser
type GetUsersResponse []GetUser
type PostUsersRequest PostUser
type GetUsersRoles []string

type GetUser struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	Email     string `json:"email"`
}

type PostUser struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}
