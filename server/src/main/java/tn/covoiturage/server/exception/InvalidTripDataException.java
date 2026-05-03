package tn.covoiturage.server.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception lancée lorsqu'une donnée métier d'un voyage est incohérente.
 * L'annotation @ResponseStatus permet de renvoyer automatiquement un code 400
 * (Bad Request).
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidTripDataException extends RuntimeException {

    public InvalidTripDataException(String message) {
        super(message);
    }

    // Il est de bonne pratique d'ajouter un constructeur avec la cause
    public InvalidTripDataException(String message, Throwable cause) {
        super(message, cause);
    }
}