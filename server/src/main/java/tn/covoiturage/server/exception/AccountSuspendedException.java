package tn.covoiturage.server.exception;

public class AccountSuspendedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AccountSuspendedException(String message) {
        super(message);
    }

    public AccountSuspendedException(String message, Throwable cause) {
        super(message, cause);
    }

    public AccountSuspendedException(Throwable cause) {
        super(cause);
    }
}