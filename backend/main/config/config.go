package config

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"os"
)

var (
	PrivateJWTKey *ecdsa.PrivateKey
	PublicJWTKey  *ecdsa.PublicKey
)

func LoadJWTKeys(privatePath, publicPath string) error {
	// Load private key
	privData, err := os.ReadFile(privatePath)
	if err != nil {
		return err
	}
	privBlock, _ := pem.Decode(privData)
	if privBlock == nil || privBlock.Type != "EC PRIVATE KEY" {
		return errors.New("invalid EC private key format")
	}
	privKey, err := x509.ParseECPrivateKey(privBlock.Bytes)
	if err != nil {
		return err
	}
	PrivateJWTKey = privKey

	// Load public key
	pubData, err := os.ReadFile(publicPath)
	if err != nil {
		return err
	}
	pubBlock, _ := pem.Decode(pubData)
	if pubBlock == nil || pubBlock.Type != "PUBLIC KEY" {
		return errors.New("invalid public key format")
	}
	pubKeyParsed, err := x509.ParsePKIXPublicKey(pubBlock.Bytes)
	if err != nil {
		return err
	}
	var ok bool
	PublicJWTKey, ok = pubKeyParsed.(*ecdsa.PublicKey)
	if !ok {
		return errors.New("public key is not ECDSA")
	}
	return nil
}
