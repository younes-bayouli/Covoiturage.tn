package tn.covoiturage.server.exception;

public class AccountBannedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AccountBannedException(String message) {
        super(message);
    }

    public AccountBannedException(String message, Throwable cause) {
        super(message, cause);
    }

    public AccountBannedException(Throwable cause) {
        super(cause);
    }
}