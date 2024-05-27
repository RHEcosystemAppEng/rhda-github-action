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
 * A catalog of dependencies accessible via the `libs` extension.
 */
@NonNullApi
public class LibrariesForLibsInPluginsBlock extends AbstractExternalDependencyFactory {

    private final AbstractExternalDependencyFactory owner = this;
    private final IoLibraryAccessors laccForIoLibraryAccessors = new IoLibraryAccessors(owner);
    private final JakartaLibraryAccessors laccForJakartaLibraryAccessors = new JakartaLibraryAccessors(owner);
    private final VersionAccessors vaccForVersionAccessors = new VersionAccessors(providers, config);
    private final BundleAccessors baccForBundleAccessors = new BundleAccessors(objects, providers, config, attributesFactory, capabilityNotationParser);
    private final PluginAccessors paccForPluginAccessors = new PluginAccessors(providers, config);

    @Inject
    public LibrariesForLibsInPluginsBlock(DefaultVersionCatalog config, ProviderFactory providers, ObjectFactory objects, ImmutableAttributesFactory attributesFactory, CapabilityNotationParser capabilityNotationParser) {
        super(config, providers, objects, attributesFactory, capabilityNotationParser);
    }

    /**
     * Returns the group of libraries at io
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public IoLibraryAccessors getIo() {
        org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
        return laccForIoLibraryAccessors;
    }

    /**
     * Returns the group of libraries at jakarta
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public JakartaLibraryAccessors getJakarta() {
        org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
        return laccForJakartaLibraryAccessors;
    }

    /**
     * Returns the group of versions at versions
     */
    public VersionAccessors getVersions() {
        return vaccForVersionAccessors;
    }

    /**
     * Returns the group of bundles at bundles
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public BundleAccessors getBundles() {
        org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
        return baccForBundleAccessors;
    }

    /**
     * Returns the group of plugins at plugins
     */
    public PluginAccessors getPlugins() {
        return paccForPluginAccessors;
    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusLibraryAccessors laccForIoQuarkusLibraryAccessors = new IoQuarkusLibraryAccessors(owner);

        public IoLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at io.quarkus
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusLibraryAccessors getQuarkus() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusLibraryAccessors laccForIoQuarkusQuarkusLibraryAccessors = new IoQuarkusQuarkusLibraryAccessors(owner);

        public IoQuarkusLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at io.quarkus.quarkus
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusLibraryAccessors getQuarkus() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusContainerLibraryAccessors laccForIoQuarkusQuarkusContainerLibraryAccessors = new IoQuarkusQuarkusContainerLibraryAccessors(owner);
        private final IoQuarkusQuarkusHibernateLibraryAccessors laccForIoQuarkusQuarkusHibernateLibraryAccessors = new IoQuarkusQuarkusHibernateLibraryAccessors(owner);
        private final IoQuarkusQuarkusJdbcLibraryAccessors laccForIoQuarkusQuarkusJdbcLibraryAccessors = new IoQuarkusQuarkusJdbcLibraryAccessors(owner);
        private final IoQuarkusQuarkusKubernetesLibraryAccessors laccForIoQuarkusQuarkusKubernetesLibraryAccessors = new IoQuarkusQuarkusKubernetesLibraryAccessors(owner);
        private final IoQuarkusQuarkusResteasyLibraryAccessors laccForIoQuarkusQuarkusResteasyLibraryAccessors = new IoQuarkusQuarkusResteasyLibraryAccessors(owner);
        private final IoQuarkusQuarkusVertxLibraryAccessors laccForIoQuarkusQuarkusVertxLibraryAccessors = new IoQuarkusQuarkusVertxLibraryAccessors(owner);

        public IoQuarkusQuarkusLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for agroal (io.quarkus:quarkus-agroal)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getAgroal() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.agroal");
        }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.container
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusContainerLibraryAccessors getContainer() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusContainerLibraryAccessors;
        }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.hibernate
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusHibernateLibraryAccessors getHibernate() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusHibernateLibraryAccessors;
        }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.jdbc
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusJdbcLibraryAccessors getJdbc() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusJdbcLibraryAccessors;
        }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.kubernetes
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusKubernetesLibraryAccessors getKubernetes() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusKubernetesLibraryAccessors;
        }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.resteasy
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusResteasyLibraryAccessors getResteasy() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusResteasyLibraryAccessors;
        }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.vertx
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusVertxLibraryAccessors getVertx() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusVertxLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusContainerLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusContainerImageLibraryAccessors laccForIoQuarkusQuarkusContainerImageLibraryAccessors = new IoQuarkusQuarkusContainerImageLibraryAccessors(owner);

        public IoQuarkusQuarkusContainerLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.container.image
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusContainerImageLibraryAccessors getImage() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusContainerImageLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusContainerImageLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusContainerImageLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for docker (io.quarkus:quarkus-container-image-docker)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getDocker() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.container.image.docker");
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusHibernateLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusHibernateOrmLibraryAccessors laccForIoQuarkusQuarkusHibernateOrmLibraryAccessors = new IoQuarkusQuarkusHibernateOrmLibraryAccessors(owner);

        public IoQuarkusQuarkusHibernateLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.hibernate.orm
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusHibernateOrmLibraryAccessors getOrm() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusHibernateOrmLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusHibernateOrmLibraryAccessors extends SubDependencyFactory implements DependencyNotationSupplier {

        public IoQuarkusQuarkusHibernateOrmLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for orm (io.quarkus:quarkus-hibernate-orm)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> asProvider() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.hibernate.orm");
        }

            /**
             * Creates a dependency provider for deployment (io.quarkus:quarkus-hibernate-orm-deployment)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getDeployment() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.hibernate.orm.deployment");
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusJdbcLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusJdbcLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for postgresql (io.quarkus:quarkus-jdbc-postgresql)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getPostgresql() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.jdbc.postgresql");
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusKubernetesLibraryAccessors extends SubDependencyFactory {
        private final IoQuarkusQuarkusKubernetesServiceLibraryAccessors laccForIoQuarkusQuarkusKubernetesServiceLibraryAccessors = new IoQuarkusQuarkusKubernetesServiceLibraryAccessors(owner);

        public IoQuarkusQuarkusKubernetesLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at io.quarkus.quarkus.kubernetes.service
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public IoQuarkusQuarkusKubernetesServiceLibraryAccessors getService() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForIoQuarkusQuarkusKubernetesServiceLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusKubernetesServiceLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusKubernetesServiceLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for binding (io.quarkus:quarkus-kubernetes-service-binding)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getBinding() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.kubernetes.service.binding");
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusResteasyLibraryAccessors extends SubDependencyFactory implements DependencyNotationSupplier {

        public IoQuarkusQuarkusResteasyLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for resteasy (io.quarkus:quarkus-resteasy)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> asProvider() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.resteasy");
        }

            /**
             * Creates a dependency provider for jackson (io.quarkus:quarkus-resteasy-jackson)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getJackson() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.resteasy.jackson");
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class IoQuarkusQuarkusVertxLibraryAccessors extends SubDependencyFactory {

        public IoQuarkusQuarkusVertxLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for http (io.quarkus:quarkus-vertx-http)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getHttp() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("io.quarkus.quarkus.vertx.http");
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class JakartaLibraryAccessors extends SubDependencyFactory {
        private final JakartaValidationLibraryAccessors laccForJakartaValidationLibraryAccessors = new JakartaValidationLibraryAccessors(owner);

        public JakartaLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at jakarta.validation
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public JakartaValidationLibraryAccessors getValidation() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForJakartaValidationLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class JakartaValidationLibraryAccessors extends SubDependencyFactory {
        private final JakartaValidationJakartaLibraryAccessors laccForJakartaValidationJakartaLibraryAccessors = new JakartaValidationJakartaLibraryAccessors(owner);

        public JakartaValidationLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at jakarta.validation.jakarta
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public JakartaValidationJakartaLibraryAccessors getJakarta() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForJakartaValidationJakartaLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class JakartaValidationJakartaLibraryAccessors extends SubDependencyFactory {
        private final JakartaValidationJakartaValidationLibraryAccessors laccForJakartaValidationJakartaValidationLibraryAccessors = new JakartaValidationJakartaValidationLibraryAccessors(owner);

        public JakartaValidationJakartaLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

        /**
         * Returns the group of libraries at jakarta.validation.jakarta.validation
         * @deprecated Will be removed in Gradle 9.0.
         */
        @Deprecated
        public JakartaValidationJakartaValidationLibraryAccessors getValidation() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
            return laccForJakartaValidationJakartaValidationLibraryAccessors;
        }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class JakartaValidationJakartaValidationLibraryAccessors extends SubDependencyFactory {

        public JakartaValidationJakartaValidationLibraryAccessors(AbstractExternalDependencyFactory owner) { super(owner); }

            /**
             * Creates a dependency provider for api (jakarta.validation:jakarta.validation-api)
             * This dependency was declared in catalog libs.versions.toml
         * @deprecated Will be removed in Gradle 9.0.
             */
        @Deprecated
            public Provider<MinimalExternalModuleDependency> getApi() {
            org.gradle.internal.deprecation.DeprecationLogger.deprecateBehaviour("Accessing libraries or bundles from version catalogs in the plugins block.").withAdvice("Only use versions or plugins from catalogs in the plugins block.").willBeRemovedInGradle9().withUpgradeGuideSection(8, "kotlin_dsl_deprecated_catalogs_plugins_block").nagUser();
                return create("jakarta.validation.jakarta.validation.api");
        }

    }

    public static class VersionAccessors extends VersionFactory  {

        private final IoVersionAccessors vaccForIoVersionAccessors = new IoVersionAccessors(providers, config);
        private final JakartaVersionAccessors vaccForJakartaVersionAccessors = new JakartaVersionAccessors(providers, config);
        public VersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.io
         */
        public IoVersionAccessors getIo() {
            return vaccForIoVersionAccessors;
        }

        /**
         * Returns the group of versions at versions.jakarta
         */
        public JakartaVersionAccessors getJakarta() {
            return vaccForJakartaVersionAccessors;
        }

    }

    public static class IoVersionAccessors extends VersionFactory  {

        private final IoQuarkusVersionAccessors vaccForIoQuarkusVersionAccessors = new IoQuarkusVersionAccessors(providers, config);
        public IoVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.io.quarkus
         */
        public IoQuarkusVersionAccessors getQuarkus() {
            return vaccForIoQuarkusVersionAccessors;
        }

    }

    public static class IoQuarkusVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusVersionAccessors vaccForIoQuarkusQuarkusVersionAccessors = new IoQuarkusQuarkusVersionAccessors(providers, config);
        public IoQuarkusVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus
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
             * Returns the version associated to this alias: io.quarkus.quarkus.agroal (2.13.5.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getAgroal() { return getVersion("io.quarkus.quarkus.agroal"); }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.container
         */
        public IoQuarkusQuarkusContainerVersionAccessors getContainer() {
            return vaccForIoQuarkusQuarkusContainerVersionAccessors;
        }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.hibernate
         */
        public IoQuarkusQuarkusHibernateVersionAccessors getHibernate() {
            return vaccForIoQuarkusQuarkusHibernateVersionAccessors;
        }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.jdbc
         */
        public IoQuarkusQuarkusJdbcVersionAccessors getJdbc() {
            return vaccForIoQuarkusQuarkusJdbcVersionAccessors;
        }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.kubernetes
         */
        public IoQuarkusQuarkusKubernetesVersionAccessors getKubernetes() {
            return vaccForIoQuarkusQuarkusKubernetesVersionAccessors;
        }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.resteasy
         */
        public IoQuarkusQuarkusResteasyVersionAccessors getResteasy() {
            return vaccForIoQuarkusQuarkusResteasyVersionAccessors;
        }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.vertx
         */
        public IoQuarkusQuarkusVertxVersionAccessors getVertx() {
            return vaccForIoQuarkusQuarkusVertxVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusContainerVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusContainerImageVersionAccessors vaccForIoQuarkusQuarkusContainerImageVersionAccessors = new IoQuarkusQuarkusContainerImageVersionAccessors(providers, config);
        public IoQuarkusQuarkusContainerVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.container.image
         */
        public IoQuarkusQuarkusContainerImageVersionAccessors getImage() {
            return vaccForIoQuarkusQuarkusContainerImageVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusContainerImageVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusContainerImageVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: io.quarkus.quarkus.container.image.docker (2.13.5.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getDocker() { return getVersion("io.quarkus.quarkus.container.image.docker"); }

    }

    public static class IoQuarkusQuarkusHibernateVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusHibernateOrmVersionAccessors vaccForIoQuarkusQuarkusHibernateOrmVersionAccessors = new IoQuarkusQuarkusHibernateOrmVersionAccessors(providers, config);
        public IoQuarkusQuarkusHibernateVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.hibernate.orm
         */
        public IoQuarkusQuarkusHibernateOrmVersionAccessors getOrm() {
            return vaccForIoQuarkusQuarkusHibernateOrmVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusHibernateOrmVersionAccessors extends VersionFactory  implements VersionNotationSupplier {

        public IoQuarkusQuarkusHibernateOrmVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the version associated to this alias: io.quarkus.quarkus.hibernate.orm (2.13.5.Final)
         * If the version is a rich version and that its not expressible as a
         * single version string, then an empty string is returned.
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> asProvider() { return getVersion("io.quarkus.quarkus.hibernate.orm"); }

            /**
             * Returns the version associated to this alias: io.quarkus.quarkus.hibernate.orm.deployment (2.0.2.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getDeployment() { return getVersion("io.quarkus.quarkus.hibernate.orm.deployment"); }

    }

    public static class IoQuarkusQuarkusJdbcVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusJdbcVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: io.quarkus.quarkus.jdbc.postgresql (2.13.5.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getPostgresql() { return getVersion("io.quarkus.quarkus.jdbc.postgresql"); }

    }

    public static class IoQuarkusQuarkusKubernetesVersionAccessors extends VersionFactory  {

        private final IoQuarkusQuarkusKubernetesServiceVersionAccessors vaccForIoQuarkusQuarkusKubernetesServiceVersionAccessors = new IoQuarkusQuarkusKubernetesServiceVersionAccessors(providers, config);
        public IoQuarkusQuarkusKubernetesVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.io.quarkus.quarkus.kubernetes.service
         */
        public IoQuarkusQuarkusKubernetesServiceVersionAccessors getService() {
            return vaccForIoQuarkusQuarkusKubernetesServiceVersionAccessors;
        }

    }

    public static class IoQuarkusQuarkusKubernetesServiceVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusKubernetesServiceVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: io.quarkus.quarkus.kubernetes.service.binding (2.13.5.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getBinding() { return getVersion("io.quarkus.quarkus.kubernetes.service.binding"); }

    }

    public static class IoQuarkusQuarkusResteasyVersionAccessors extends VersionFactory  implements VersionNotationSupplier {

        public IoQuarkusQuarkusResteasyVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the version associated to this alias: io.quarkus.quarkus.resteasy (2.13.5.Final)
         * If the version is a rich version and that its not expressible as a
         * single version string, then an empty string is returned.
         * This version was declared in catalog libs.versions.toml
         */
        public Provider<String> asProvider() { return getVersion("io.quarkus.quarkus.resteasy"); }

            /**
             * Returns the version associated to this alias: io.quarkus.quarkus.resteasy.jackson (2.13.5.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getJackson() { return getVersion("io.quarkus.quarkus.resteasy.jackson"); }

    }

    public static class IoQuarkusQuarkusVertxVersionAccessors extends VersionFactory  {

        public IoQuarkusQuarkusVertxVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: io.quarkus.quarkus.vertx.http (2.13.5.Final)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getHttp() { return getVersion("io.quarkus.quarkus.vertx.http"); }

    }

    public static class JakartaVersionAccessors extends VersionFactory  {

        private final JakartaValidationVersionAccessors vaccForJakartaValidationVersionAccessors = new JakartaValidationVersionAccessors(providers, config);
        public JakartaVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.jakarta.validation
         */
        public JakartaValidationVersionAccessors getValidation() {
            return vaccForJakartaValidationVersionAccessors;
        }

    }

    public static class JakartaValidationVersionAccessors extends VersionFactory  {

        private final JakartaValidationJakartaVersionAccessors vaccForJakartaValidationJakartaVersionAccessors = new JakartaValidationJakartaVersionAccessors(providers, config);
        public JakartaValidationVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.jakarta.validation.jakarta
         */
        public JakartaValidationJakartaVersionAccessors getJakarta() {
            return vaccForJakartaValidationJakartaVersionAccessors;
        }

    }

    public static class JakartaValidationJakartaVersionAccessors extends VersionFactory  {

        private final JakartaValidationJakartaValidationVersionAccessors vaccForJakartaValidationJakartaValidationVersionAccessors = new JakartaValidationJakartaValidationVersionAccessors(providers, config);
        public JakartaValidationJakartaVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the group of versions at versions.jakarta.validation.jakarta.validation
         */
        public JakartaValidationJakartaValidationVersionAccessors getValidation() {
            return vaccForJakartaValidationJakartaValidationVersionAccessors;
        }

    }

    public static class JakartaValidationJakartaValidationVersionAccessors extends VersionFactory  {

        public JakartaValidationJakartaValidationVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: jakarta.validation.jakarta.validation.api (2.0.2)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             * This version was declared in catalog libs.versions.toml
             */
            public Provider<String> getApi() { return getVersion("jakarta.validation.jakarta.validation.api"); }

    }

    /**
     * @deprecated Will be removed in Gradle 9.0.
     */
    @Deprecated
    public static class BundleAccessors extends BundleFactory {

        public BundleAccessors(ObjectFactory objects, ProviderFactory providers, DefaultVersionCatalog config, ImmutableAttributesFactory attributesFactory, CapabilityNotationParser capabilityNotationParser) { super(objects, providers, config, attributesFactory, capabilityNotationParser); }

    }

    public static class PluginAccessors extends PluginFactory {

        public PluginAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

    }

}
