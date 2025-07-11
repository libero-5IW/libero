<template>
  <v-container class="py-8">
    <v-card class="pa-6 elevation-2">
      <v-card-title class="text-h5 font-weight-bold mb-4">
        Politique de confidentialité
      </v-card-title>
      <v-divider class="mb-6" />
      <v-card-text>
        <div class="mb-4">
          La présente politique de confidentialité décrit comment [Nom de l'application / Nom de l'entreprise] collecte, utilise, conserve et protège les données personnelles de ses utilisateurs, conformément au <strong>Règlement Général sur la Protection des Données (RGPD – UE 2016/679)</strong>.
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>1. Responsable du traitement</strong><br>
          <strong>Nom de l'entreprise :</strong> [Nom ou raison sociale]<br>
          <strong>Adresse :</strong> [Adresse postale complète]<br>
          <strong>Email de contact :</strong> [Email dédié RGPD ou de contact général]<br>
          <strong>Délégué à la protection des données (DPO) :</strong> [Nom, si applicable]
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>2. Données collectées</strong><br>
          Nous collectons uniquement les données nécessaires à l'utilisation de la plateforme :
          <ul>
            <li>Données d'identité : nom, prénom, adresse email, numéro SIRET (facultatif), etc.</li>
            <li>Données de connexion : adresse IP, logs d'authentification.</li>
            <li>Données d'activité : documents générés (factures, devis, contrats), revenus saisis, simulations URSSAF.</li>
            <li>Données de facturation (si service payant) : informations de paiement (traitées par un prestataire sécurisé, ex. Stripe).</li>
          </ul>
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>3. Finalités du traitement</strong><br>
          Les données personnelles sont traitées pour :
          <ul>
            <li>La création et la gestion du compte utilisateur ;</li>
            <li>La fourniture des fonctionnalités de l'application ;</li>
            <li>Le calcul et l'affichage de statistiques ou estimations (URSSAF, chiffre d'affaires, etc.) ;</li>
            <li>La communication technique (emails transactionnels, alertes…) ;</li>
            <li>L'amélioration du service (logs techniques anonymisés).</li>
          </ul>
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>4. Base légale du traitement</strong><br>
          Les traitements reposent sur les fondements suivants :
          <ul>
            <li><strong>Exécution contractuelle</strong> : pour la fourniture des services (article 6.1.b RGPD) ;</li>
            <li><strong>Consentement</strong> : pour l'envoi de communications non obligatoires (newsletter, etc.) ;</li>
            <li><strong>Intérêt légitime</strong> : pour la sécurité et l'amélioration de la plateforme.</li>
          </ul>
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>5. Durée de conservation</strong><br>
          Les données personnelles sont conservées :
          <ul>
            <li>Tant que le compte est actif ;</li>
            <li>Puis supprimées automatiquement après <strong>[X mois / 1 an]</strong> d'inactivité ou à la demande expresse de l'utilisateur.</li>
          </ul>
          Les documents générés sont conservés pour permettre leur réutilisation et historique, sauf suppression manuelle.
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>6. Partage des données</strong><br>
          Les données ne sont jamais vendues. Elles peuvent être partagées uniquement avec :
          <ul>
            <li>Les sous-traitants techniques (hébergeur, fournisseur d'email, prestataire de paiement), tous soumis à des obligations de confidentialité ;</li>
            <li>Les autorités compétentes si la loi l'exige.</li>
          </ul>
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>7. Localisation et sécurité des données</strong><br>
          Les données sont <strong>hébergées au sein de l'Union Européenne</strong>.<br>
          Des mesures de sécurité techniques et organisationnelles sont mises en place : chiffrement, mots de passe hashés, journalisation des accès, contrôle d'accès strict.
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>8. Vos droits</strong><br>
          Conformément au RGPD, vous disposez des droits suivants :
          <ul>
            <li>Droit d'accès à vos données ;</li>
            <li>Droit de rectification ;</li>
            <li>Droit à l'effacement ("droit à l'oubli") ;</li>
            <li>Droit d'opposition ;</li>
            <li>Droit à la limitation du traitement ;</li>
            <li>Droit à la portabilité.</li>
          </ul>
          Vous pouvez exercer ces droits à tout moment en contactant :<br>
          📧 <strong>[adresse email de contact]</strong>
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>9. Cookies</strong><br>
          Le site utilise uniquement des cookies essentiels au bon fonctionnement de la plateforme. Aucun cookie publicitaire ou de tracking tiers n'est utilisé sans consentement.
        </div>
        <v-divider class="my-4" />
        <div class="mb-4">
          <strong>10. Mise à jour</strong><br>
          Cette politique peut être modifiée à tout moment. La dernière mise à jour a eu lieu le : <strong>[Date]</strong>.
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
</script> 