package org.gradle.accessors.dm;

import org.gradle.api.NonNullApi;
import org.gradle.api.artifacts.MinimalExternalModuleDependency;
import org.gradle.plugin.use.PluginDependency;
import org.gradle.api.artifacts.ExternalModuleDependencyBundle;
import org.gradle.api.artifacts.MutableVersionConstraint;
import org.gradle.api.provider.Provider;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.api.internal.catalog.AbstractExternalDependencyFactory;
import org.gradle.api.internal.catalog.DefaultVersionCatalog;
import java.util.Map;
import org.gradle.api.internal.attributes.ImmutableAttributesFactory;
import org.gradle.api.internal.artifacts.dsl.CapabilityNotationParser;
import javax.inject.Inject;

/**
 * A catalog of dependencies accessible via the {@code libs} extension.
 */
@NonNullApi
public class LibrariesForLibs extends AbstractExternalDependencyFactory {

    private final AbstractExternalDependencyFactory owner = this;
    private final IoLibraryAccessors laccForIoLibraryAccessors = new IoLibraryAccessors(owner);
    private final JakartaLibraryAccessors laccForJakartaLibraryAccessors = new JakartaLibraryAccessors(owner);
    private final VersionAccessors vaccForVersionAccessors = new VersionAccessors(providers, config);
    private final BundleAccessors baccForBundleAccessors = new BundleAccessors(objects, providers, config, attributesFactory, capabilityNotationParser);
    private final PluginAccessors paccForPluginAccessors = new PluginAccessors(providers, config);

    @Inject
    public LibrariesForLibs(DefaultVersionCatalog config, ProviderFactory providers, ObjectFactory objects, ImmutableAttributesFactory attributesFactory, CapabilityNotationParser capabilityNotationParser) {
        super(config, providers, objects, attributesFactory, capabilityNotationParser);
    }

    /**
     * Group of libraries at <b>io</b>
     */
    public IoLibraryAccessors getIo() {
        return laccForIoLibraryAccessors;
    }

    /**
     * Group of libraries at <b>jakarta</b>
     */
    public JakartaLibraryAccessors getJakarta() {
        return laccForJakartaLibraryAccessors;
    }

    /**
     * Group of versions at <b>versions</b>
     */
    public VersionAccessors getVersions() {
        return vaccForVersionAccessors;
    }

    /**
     * Group of bundles at <b>bundles</b>
     */
    public BundleAccessors getBundles() {
        return baccForBundleAccessors;
    }

    /**
     * Group of plugins at <b>plugins</b>
     */
    public PluginAccessors getPlugins() {
        return paccForPluginAccessors;
    }

    public static class IoLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusLibraryAccessors laccForIoQuarkusLibraryAccessors = new IoQuarkusLibraryAccessors(owner);

        public IoLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>io.quarkus</b>
         */
        public IoQuarkusLibraryAccessors getQuarkus() {
            return laccForIoQuarkusLibraryAccessors;
        }

    }

    public static class IoQuarkusLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusLibraryAccessors laccForIoQuarkusQuarkusLibraryAccessors = new IoQuarkusQuarkusLibraryAccessors(owner);

        public IoQuarkusLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>io.quarkus.quarkus</b>
         */
        public IoQuarkusQuarkusLibraryAccessors getQuarkus() {
            return laccForIoQuarkusQuarkusLibraryAccessors;
        }

    }

    public static class IoQuarkusQuarkusLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusContainerLibraryAccessors laccForIoQuarkusQuarkusContainerLibraryAccessors = new IoQuarkusQuarkusContainerLibraryAccessors(owner);
        private final IoQuarkusQuarkusHibernateLibraryAccessors laccForIoQuarkusQuarkusHibernateLibraryAccessors = new IoQuarkusQuarkusHibernateLibraryAccessors(owner);
        private final IoQuarkusQuarkusJdbcLibraryAccessors laccForIoQuarkusQuarkusJdbcLibraryAccessors = new IoQuarkusQuarkusJdbcLibraryAccessors(owner);
        private final IoQuarkusQuarkusKubernetesLibraryAccessors laccForIoQuarkusQuarkusKubernetesLibraryAccessors = new IoQuarkusQuarkusKubernetesLibraryAccessors(owner);
        private final IoQuarkusQuarkusResteasyLibraryAccessors laccForIoQuarkusQuarkusResteasyLibraryAccessors = new IoQuarkusQuarkusResteasyLibraryAccessors(owner);
        private final IoQuarkusQuarkusVertxLibraryAccessors laccForIoQuarkusQuarkusVertxLibraryAccessors = new IoQuarkusQuarkusVertxLibraryAccessors(owner);

        public IoQuarkusQuarkusLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>agroal</b> with <b>io.quarkus:quarkus-agroal</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.agroal</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getAgroal() {
            return create("io.quarkus.quarkus.agroal");
        }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.container</b>
         */
        public IoQuarkusQuarkusContainerLibraryAccessors getContainer() {
            return laccForIoQuarkusQuarkusContainerLibraryAccessors;
        }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.hibernate</b>
         */
        public IoQuarkusQuarkusHibernateLibraryAccessors getHibernate() {
            return laccForIoQuarkusQuarkusHibernateLibraryAccessors;
        }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.jdbc</b>
         */
        public IoQuarkusQuarkusJdbcLibraryAccessors getJdbc() {
            return laccForIoQuarkusQuarkusJdbcLibraryAccessors;
        }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.kubernetes</b>
         */
        public IoQuarkusQuarkusKubernetesLibraryAccessors getKubernetes() {
            return laccForIoQuarkusQuarkusKubernetesLibraryAccessors;
        }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.resteasy</b>
         */
        public IoQuarkusQuarkusResteasyLibraryAccessors getResteasy() {
            return laccForIoQuarkusQuarkusResteasyLibraryAccessors;
        }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.vertx</b>
         */
        public IoQuarkusQuarkusVertxLibraryAccessors getVertx() {
            return laccForIoQuarkusQuarkusVertxLibraryAccessors;
        }

    }

    public static class IoQuarkusQuarkusContainerLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusContainerImageLibraryAccessors laccForIoQuarkusQuarkusContainerImageLibraryAccessors = new IoQuarkusQuarkusContainerImageLibraryAccessors(owner);

        public IoQuarkusQuarkusContainerLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.container.image</b>
         */
        public IoQuarkusQuarkusContainerImageLibraryAccessors getImage() {
            return laccForIoQuarkusQuarkusContainerImageLibraryAccessors;
        }

    }

    public static class IoQuarkusQuarkusContainerImageLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusContainerImageLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>docker</b> with <b>io.quarkus:quarkus-container-image-docker</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.container.image.docker</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getDocker() {
            return create("io.quarkus.quarkus.container.image.docker");
        }

    }

    public static class IoQuarkusQuarkusHibernateLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusHibernateOrmLibraryAccessors laccForIoQuarkusQuarkusHibernateOrmLibraryAccessors = new IoQuarkusQuarkusHibernateOrmLibraryAccessors(owner);

        public IoQuarkusQuarkusHibernateLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.hibernate.orm</b>
         */
        public IoQuarkusQuarkusHibernateOrmLibraryAccessors getOrm() {
            return laccForIoQuarkusQuarkusHibernateOrmLibraryAccessors;
        }

    }

    public static class IoQuarkusQuarkusHibernateOrmLibraryAccessors extends SubDependencyFactory implements DependencyNotationSupplier {

        public IoQuarkusQuarkusHibernateOrmLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>orm</b> with <b>io.quarkus:quarkus-hibernate-orm</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.hibernate.orm</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> asProvider() {
            return create("io.quarkus.quarkus.hibernate.orm");
        }

        /**
         * Dependency provider for <b>deployment</b> with <b>io.quarkus:quarkus-hibernate-orm-deployment</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.hibernate.orm.deployment</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getDeployment() {
            return create("io.quarkus.quarkus.hibernate.orm.deployment");
        }

    }

    public static class IoQuarkusQuarkusJdbcLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusJdbcLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>postgresql</b> with <b>io.quarkus:quarkus-jdbc-postgresql</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.jdbc.postgresql</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getPostgresql() {
            return create("io.quarkus.quarkus.jdbc.postgresql");
        }

    }

    public static class IoQuarkusQuarkusKubernetesLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusKubernetesServiceLibraryAccessors laccForIoQuarkusQuarkusKubernetesServiceLibraryAccessors = new IoQuarkusQuarkusKubernetesServiceLibraryAccessors(owner);

        public IoQuarkusQuarkusKubernetesLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>io.quarkus.quarkus.kubernetes.service</b>
         */
        public IoQuarkusQuarkusKubernetesServiceLibraryAccessors getService() {
            return laccForIoQuarkusQuarkusKubernetesServiceLibraryAccessors;
        }

    }

    public static class IoQuarkusQuarkusKubernetesServiceLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusKubernetesServiceLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>binding</b> with <b>io.quarkus:quarkus-kubernetes-service-binding</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.kubernetes.service.binding</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getBinding() {
            return create("io.quarkus.quarkus.kubernetes.service.binding");
        }

    }

    public static class IoQuarkusQuarkusResteasyLibraryAccessors extends SubDependencyFactory implements DependencyNotationSupplier {

        public IoQuarkusQuarkusResteasyLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>resteasy</b> with <b>io.quarkus:quarkus-resteasy</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.resteasy</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> asProvider() {
            return create("io.quarkus.quarkus.resteasy");
        }

        /**
         * Dependency provider for <b>jackson</b> with <b>io.quarkus:quarkus-resteasy-jackson</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.resteasy.jackson</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getJackson() {
            return create("io.quarkus.quarkus.resteasy.jackson");
        }

    }

    public static class IoQuarkusQuarkusVertxLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusVertxLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>http</b> with <b>io.quarkus:quarkus-vertx-http</b> coordinates and
         * with version reference <b>io.quarkus.quarkus.vertx.http</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getHttp() {
            return create("io.quarkus.quarkus.vertx.http");
        }

    }

    public static class JakartaLibraryAccessors extends SubDependencyFactory {
        private final JakartaValidationLibraryAccessors laccForJakartaValidationLibraryAccessors = new JakartaValidationLibraryAccessors(owner);

        public JakartaLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>jakarta.validation</b>
         */
        public JakartaValidationLibraryAccessors getValidation() {
            return laccForJakartaValidationLibraryAccessors;
        }

    }

    public static class JakartaValidationLibraryAccessors extends SubDependencyFactory {
        private final JakartaValidationJakartaLibraryAccessors laccForJakartaValidationJakartaLibraryAccessors = new JakartaValidationJakartaLibraryAccessors(owner);

        public JakartaValidationLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>jakarta.validation.jakarta</b>
         */
        public JakartaValidationJakartaLibraryAccessors getJakarta() {
            return laccForJakartaValidationJakartaLibraryAccessors;
        }

    }

    public static class JakartaValidationJakartaLibraryAccessors extends SubDependencyFactory {
        private final JakartaValidationJakartaValidationLibraryAccessors laccForJakartaValidationJakartaValidationLibraryAccessors = new JakartaValidationJakartaValidationLibraryAccessors(owner);

        public JakartaValidationJakartaLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Group of libraries at <b>jakarta.validation.jakarta.validation</b>
         */
        public JakartaValidationJakartaValidationLibraryAccessors getValidation() {
            return laccForJakartaValidationJakartaValidationLibraryAccessors;
        }

    }

    public static class JakartaValidationJakartaValidationLibraryAccessors extends SubDependencyFactory {

        public JakartaValidationJakartaValidationLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Dependency provider for <b>api</b> with <b>jakarta.validation:jakarta.validation-api</b> coordinates and
         * with version reference <b>jakarta.validation.jakarta.validation.api</b>
         * <p>
         * This dependency was declared in catalog libs.versions.toml
         */
        public Provider<MinimalExternalModuleDependency> getApi() {
            return create("jakarta.validation.jakarta.validation.api");
        }

    }

    public static class VersionAccessors extends VersionFactory  {

        private final IoVersionAccessors vaccForIoVersionAccessors = new IoVersionAccessors(providers, config);
        private final JakartaVersionAccessors vaccForJakartaVersionAccessors = new JakartaVersionAccessors(providers, config);
        public VersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.io</b>
         */
        public IoVersionAccessors getIo() {
            return vaccForIoVersionAccessors;
        }

        /**
         * Group of versions at <b>versions.jakarta</b>
         */
        public JakartaVersionAccessors getJakarta() {
            return vaccForJakartaVersionAccessors;
        }

    }

    public static class IoVersionAccessors extends VersionFactory  {

        private final IoQuarkusVersionAccessors vaccForIoQuarkusVersionAccessors = new IoQuarkusVersionAccessors(providers, config);
        public IoVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.io.quarkus</b>
         */
        public IoQuarkusVersionAccessors getQuarkus() {
            return vaccForIoQuarkusVersionAccessors;
        }

    }

    public static class IoQuarkusVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusVersionAccessors vaccForIoQuarkusQuarkusVersionAccessors = new IoQuarkusQuarkusVersionAccessors(providers, config);
        public IoQuarkusVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus</b>
         */
        public IoQuarkusQuarkusVersionAccessors getQuarkus() {
            return vaccForIoQuarkusQuarkusVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusContainerVersionAccessors vaccForIoQuarkusQuarkusContainerVersionAccessors = new IoQuarkusQuarkusContainerVersionAccessors(providers, config);
        private final IoQuarkusQuarkusHibernateVersionAccessors vaccForIoQuarkusQuarkusHibernateVersionAccessors = new IoQuarkusQuarkusHibernateVersionAccessors(providers, config);
        private final IoQuarkusQuarkusJdbcVersionAccessors vaccForIoQuarkusQuarkusJdbcVersionAccessors = new IoQuarkusQuarkusJdbcVersionAccessors(providers, config);
        private final IoQuarkusQuarkusKubernetesVersionAccessors vaccForIoQuarkusQuarkusKubernetesVersionAccessors = new IoQuarkusQuarkusKubernetesVersionAccessors(providers, config);
        private final IoQuarkusQuarkusResteasyVersionAccessors vaccForIoQuarkusQuarkusResteasyVersionAccessors = new IoQuarkusQuarkusResteasyVersionAccessors(providers, config);
        private final IoQuarkusQuarkusVertxVersionAccessors vaccForIoQuarkusQuarkusVertxVersionAccessors = new IoQuarkusQuarkusVertxVersionAccessors(providers, config);
        public IoQuarkusQuarkusVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.agroal</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getAgroal() { return getVersion("io.quarkus.quarkus.agroal"); }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.container</b>
         */
        public IoQuarkusQuarkusContainerVersionAccessors getContainer() {
            return vaccForIoQuarkusQuarkusContainerVersionAccessors;
        }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.hibernate</b>
         */
        public IoQuarkusQuarkusHibernateVersionAccessors getHibernate() {
            return vaccForIoQuarkusQuarkusHibernateVersionAccessors;
        }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.jdbc</b>
         */
        public IoQuarkusQuarkusJdbcVersionAccessors getJdbc() {
            return vaccForIoQuarkusQuarkusJdbcVersionAccessors;
        }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.kubernetes</b>
         */
        public IoQuarkusQuarkusKubernetesVersionAccessors getKubernetes() {
            return vaccForIoQuarkusQuarkusKubernetesVersionAccessors;
        }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.resteasy</b>
         */
        public IoQuarkusQuarkusResteasyVersionAccessors getResteasy() {
            return vaccForIoQuarkusQuarkusResteasyVersionAccessors;
        }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.vertx</b>
         */
        public IoQuarkusQuarkusVertxVersionAccessors getVertx() {
            return vaccForIoQuarkusQuarkusVertxVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusContainerVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusContainerImageVersionAccessors vaccForIoQuarkusQuarkusContainerImageVersionAccessors = new IoQuarkusQuarkusContainerImageVersionAccessors(providers, config);
        public IoQuarkusQuarkusContainerVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.container.image</b>
         */
        public IoQuarkusQuarkusContainerImageVersionAccessors getImage() {
            return vaccForIoQuarkusQuarkusContainerImageVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusContainerImageVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusContainerImageVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.container.image.docker</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getDocker() { return getVersion("io.quarkus.quarkus.container.image.docker"); }

    }

    public static class IoQuarkusQuarkusHibernateVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusHibernateOrmVersionAccessors vaccForIoQuarkusQuarkusHibernateOrmVersionAccessors = new IoQuarkusQuarkusHibernateOrmVersionAccessors(providers, config);
        public IoQuarkusQuarkusHibernateVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.hibernate.orm</b>
         */
        public IoQuarkusQuarkusHibernateOrmVersionAccessors getOrm() {
            return vaccForIoQuarkusQuarkusHibernateOrmVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusHibernateOrmVersionAccessors extends VersionFactory  implements VersionNotationSupplier {

        public IoQuarkusQuarkusHibernateOrmVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.hibernate.orm</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> asProvider() { return getVersion("io.quarkus.quarkus.hibernate.orm"); }

        /**
         * Version alias <b>io.quarkus.quarkus.hibernate.orm.deployment</b> with value <b>2.0.2.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getDeployment() { return getVersion("io.quarkus.quarkus.hibernate.orm.deployment"); }

    }

    public static class IoQuarkusQuarkusJdbcVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusJdbcVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.jdbc.postgresql</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getPostgresql() { return getVersion("io.quarkus.quarkus.jdbc.postgresql"); }

    }

    public static class IoQuarkusQuarkusKubernetesVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusKubernetesServiceVersionAccessors vaccForIoQuarkusQuarkusKubernetesServiceVersionAccessors = new IoQuarkusQuarkusKubernetesServiceVersionAccessors(providers, config);
        public IoQuarkusQuarkusKubernetesVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.io.quarkus.quarkus.kubernetes.service</b>
         */
        public IoQuarkusQuarkusKubernetesServiceVersionAccessors getService() {
            return vaccForIoQuarkusQuarkusKubernetesServiceVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusKubernetesServiceVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusKubernetesServiceVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.kubernetes.service.binding</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getBinding() { return getVersion("io.quarkus.quarkus.kubernetes.service.binding"); }

    }

    public static class IoQuarkusQuarkusResteasyVersionAccessors extends VersionFactory  implements VersionNotationSupplier {

        public IoQuarkusQuarkusResteasyVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.resteasy</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> asProvider() { return getVersion("io.quarkus.quarkus.resteasy"); }

        /**
         * Version alias <b>io.quarkus.quarkus.resteasy.jackson</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getJackson() { return getVersion("io.quarkus.quarkus.resteasy.jackson"); }

    }

    public static class IoQuarkusQuarkusVertxVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusVertxVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>io.quarkus.quarkus.vertx.http</b> with value <b>2.13.5.Final</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getHttp() { return getVersion("io.quarkus.quarkus.vertx.http"); }

    }

    public static class JakartaVersionAccessors extends VersionFactory  {

        private final JakartaValidationVersionAccessors vaccForJakartaValidationVersionAccessors = new JakartaValidationVersionAccessors(providers, config);
        public JakartaVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.jakarta.validation</b>
         */
        public JakartaValidationVersionAccessors getValidation() {
            return vaccForJakartaValidationVersionAccessors;
        }

    }

    public static class JakartaValidationVersionAccessors extends VersionFactory  {

        private final JakartaValidationJakartaVersionAccessors vaccForJakartaValidationJakartaVersionAccessors = new JakartaValidationJakartaVersionAccessors(providers, config);
        public JakartaValidationVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.jakarta.validation.jakarta</b>
         */
        public JakartaValidationJakartaVersionAccessors getJakarta() {
            return vaccForJakartaValidationJakartaVersionAccessors;
        }

    }

    public static class JakartaValidationJakartaVersionAccessors extends VersionFactory  {

        private final JakartaValidationJakartaValidationVersionAccessors vaccForJakartaValidationJakartaValidationVersionAccessors = new JakartaValidationJakartaValidationVersionAccessors(providers, config);
        public JakartaValidationJakartaVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Group of versions at <b>versions.jakarta.validation.jakarta.validation</b>
         */
        public JakartaValidationJakartaValidationVersionAccessors getValidation() {
            return vaccForJakartaValidationJakartaValidationVersionAccessors;
        }

    }

    public static class JakartaValidationJakartaValidationVersionAccessors extends VersionFactory  {

        public JakartaValidationJakartaValidationVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Version alias <b>jakarta.validation.jakarta.validation.api</b> with value <b>2.0.2</b>
         * <p>
         * If the version is a rich version and cannot be represented as a
         * single version string, an empty string is returned.
         * <p>
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> getApi() { return getVersion("jakarta.validation.jakarta.validation.api"); }

    }

    public static class BundleAccessors extends BundleFactory {

        public BundleAccessors(ObjectFactory objects, ProviderFactory providers, DefaultVersionCatalog config, ImmutableAttributesFactory attributesFactory, CapabilityNotationParser capabilityNotationParser) { super(objects, providers, config, attributesFactory, capabilityNotationParser); }

    }

    public static class PluginAccessors extends PluginFactory {

        public PluginAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

    }

}