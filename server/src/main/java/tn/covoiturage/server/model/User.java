package tn.covoiturage.server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    private String nom;
    private String prenom;
    private String telephone;
    private String ville;
    private String avatarUrl;
    
    private Double note = 5.0;
    private Integer trajetsEffectues = 0;
    private Integer trajetsEnTantQueConducteur = 0;
    private Integer trajetsEnTantQuePassager = 0;
    
    private Boolean identiteVerifiee = false;
    private Boolean telephoneVerifie = false;
    
    private LocalDateTime membreDepuis = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    private Role role = Role.USER;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public Double getNote() { return note; }
    public void setNote(Double note) { this.note = note; }

    public Integer getTrajetsEffectues() { return trajetsEffectues; }
    public void setTrajetsEffectues(Integer trajetsEffectues) { this.trajetsEffectues = trajetsEffectues; }

    public Integer getTrajetsEnTantQueConducteur() { return trajetsEnTantQueConducteur; }
    public void setTrajetsEnTantQueConducteur(Integer trajetsEnTantQueConducteur) { this.trajetsEnTantQueConducteur = trajetsEnTantQueConducteur; }

    public Integer getTrajetsEnTantQuePassager() { return trajetsEnTantQuePassager; }
    public void setTrajetsEnTantQuePassager(Integer trajetsEnTantQuePassager) { this.trajetsEnTantQuePassager = trajetsEnTantQuePassager; }

    public Boolean getIdentiteVerifiee() { return identiteVerifiee; }
    public void setIdentiteVerifiee(Boolean identiteVerifiee) { this.identiteVerifiee = identiteVerifiee; }

    public Boolean getTelephoneVerifie() { return telephoneVerifie; }
    public void setTelephoneVerifie(Boolean telephoneVerifie) { this.telephoneVerifie = telephoneVerifie; }

    public LocalDateTime getMembreDepuis() { return membreDepuis; }
    public void setMembreDepuis(LocalDateTime membreDepuis) { this.membreDepuis = membreDepuis; }

    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
