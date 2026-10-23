import { route as buildInfo } from "./info/buildInfo";
import { route as technologiesInfo } from "./info/technologiesInfo";
import { route as attributesLookup } from "./lookup/attributesLookup";
import { route as attributeLookup } from "./lookup/attributeLookup";
import { route as extensionLookup } from "./lookup/extensionLookup";
import { route as narList } from "./lookup/narList";
import { route as attributeList } from "./lookup/attributeList";
import { route as extensionList} from "./lookup/extensionList";
import { route as tagList } from "./lookup/tagList";
import { route as narLookup } from "./lookup/narLookup";
import { route as narReader } from "./lookup/narReader";
import { route as packageFlowFile } from "./package/package";
import { route as source } from "./source";
import { route as home } from "./home";
import { route as settings } from "./settings";
import { UnpackageFileLookupRoute} from "./unpackage/unpackageFileLookup";
import { UnpackageRoute} from "./unpackage/unpackage";
import { ViewFlowFileRoute } from "./unpackage/unpackageFlowFileLookup";
import { ViewFlowFilesRoute } from "./unpackage/unpackageFlowFileList";
import { MergeCidrsRoute } from "./mergecidrs/MergeCidrsRoute";
import { Nf3tCliRoute } from "./nf3tcli/nf3tcli";
import { mavenCoordinateResolverRoute } from "./mavenCoordinate/mavenCoordinateResolver";
import { PdfCombinerRoute } from "./pdfcombiner/PdfCombinerRoute";
import { GithubPagesDnsRoute } from "./githubpagesdns/GithubPagesDnsRoute";
import { AiStanceRoute } from "./aistance/AiStanceRoute";
import { AvailabilityRoute } from "./availability/AvailabilityRoute";

export const routeChildren = [
  buildInfo,
  technologiesInfo,
  attributesLookup,
  attributeLookup,
  extensionLookup,
  extensionList,
  narList,
  narLookup,
  narReader,
  packageFlowFile,
  UnpackageRoute,
  UnpackageFileLookupRoute,
  ViewFlowFileRoute,
  ViewFlowFilesRoute,
  source,
  home,
  attributeList,
  settings,
  tagList,
  MergeCidrsRoute,
  Nf3tCliRoute,
  mavenCoordinateResolverRoute,
  PdfCombinerRoute,
  GithubPagesDnsRoute,
  AiStanceRoute,
  AvailabilityRoute,
]

export const routePaths = routeChildren.map(x => x.path);
export type RoutePathType = typeof routePaths[0];

export type SourceReference = {
  url: string,
  name: string,
  prefix: string,
}

// https://github.com/apache/nifi/blob/main/nifi-extension-bundles/nifi-standard-bundle/nifi-standard-processors/src/main/java/org/apache/nifi/processors/standard/UnpackContent.java

const FlowFileUnpackagerV3Reference: SourceReference = {
  url: "https://github.com/apache/nifi/blob/main/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFileUnpackagerV3.java",
  name: "FlowFileUnpackagerV3.java",
  prefix: "Javascript Port of ",
}

// https://github.com/apache/nifi/blob/main/nifi-extension-bundles/nifi-standard-bundle/nifi-standard-processors/src/main/java/org/apache/nifi/processors/standard/PackageFlowFile.java#L121

const FlowFilePackagerV3Reference: SourceReference = {
  url: "https://github.com/apache/nifi/blob/main/nifi-commons/nifi-flowfile-packager/src/main/java/org/apache/nifi/util/FlowFilePackagerV3.java",
  name: "FlowFilePackagerV3.java",
  prefix: "Javascript Port of ",
}

const GithubRepositoryReference = {
  url: "https://github.com/jgwoolley/nf3t-web",
  name: "https://github.com/jgwoolley/nf3t-web",
  prefix: "The source code of this project is stored at ",
}

export const sourceReferences = {
  FlowFileUnpackagerV3: FlowFileUnpackagerV3Reference,
  FlowFilePackagerV3: FlowFilePackagerV3Reference,
  GithubRepository: GithubRepositoryReference,
}

export interface RouteDescription {
  to: RoutePathType,
  source?: SourceReference,
  name: string,
  shortName?: string,
  shortDescription: string,
  description?: string,
}

export const routeDescriptions: Record<RoutePathType, RouteDescription> = {
  "/": {
    to: "/",
    name: "Nifi FlowFile Tools",
    shortName: "Home",
    shortDescription: "Project Home",
    description: "This is a ReactJS web app that will allow you to package and unpackage Apache Nifi FlowFiles. All the processing occurs in the browser locally."
  },
  "/buildInfo": {
    to: "/buildInfo",
    name: "Build Information",
    shortDescription: "Describes how the project is build.",
  },
  "/settings": {
    to: "/settings",
    name: "Program Settings",
    shortDescription: "Change the settings for Nf3t Tools.",
  },
  "/technologiesInfo": {
    to: "/technologiesInfo",
    name: "Technology Table",
    shortDescription: "Lists the technologies utilized in this project.",
  },
  "/attributesLookup": {
    to: "/attributesLookup",
    name: "Attributes Lookup",
    shortDescription: "Review Nifi Processors that either write to or read the attributes.",
  },
  "/nf3tcli": {
    to: "/nf3tcli",
    name: "Nf3t Command Line Interface",
    shortName: "Nf3t CLI",
    shortDescription: "A Java CLI for parsing Apache NiFi FlowFileStreams.",
    description: "A Java CLI for parsing Apache NiFi FlowFileStreams. One or more FlowFiles can be serialized into a FlowFileStream, in one of three formats.",
  },
  "/attributeLookup": {
    to: "/attributeLookup",
    name: "Attribute Item",
    shortDescription: "The information of a specific attribute.",
  },
  "/extensionLookup": {
    to: "/extensionLookup",
    name: "Extension Item",
    shortDescription: "The information of a specific extension.",
  },
  "/extensionList": {
    to: "/extensionList",
    name: "Extension List",
    shortDescription: "The information of a specific extension.",
  },
  "/narLookup": {
    to: "/narLookup",
    name: "Nar Item",
    shortDescription: "The information of a specific Nar.",
  },
  "/narList": {
    to: "/narList",
    name: "Nar List",
    shortDescription: "Lists all Nars and their information.",
  },
  "/attributeList": {
    to: "/attributeList",
    name: "Attribute List",
    shortDescription: "Lists all attribute and their information.",
  },
  "/narReader": {
    to: "/narReader",
    name: "Nar Reader",
    shortDescription: "Reads Nar files for some extra information.",
    description: "Reads Nar files for some extra information that aids in determining where the FlowFile came from.",
  },
  "/package": {
    to: "/package",
    source: FlowFilePackagerV3Reference,
    name: "Packager",
    shortDescription: "Package a file, and its attributes into a FlowFile.",
  },
  "/unpackage": {
    to: "/unpackage",
    name: "Unpackager",
    shortDescription: "Unpackages files for further processing.",
  },
  "/unpackageFileLookup": {
    to: "/unpackageFileLookup",
    name: "Parent File",
    shortName: "Parent File",
    shortDescription: "Parent File",
    description: "Parent File",
  },
  "/unpackageFlowFileLookup": {
    to: "/unpackageFlowFileLookup",
    source: FlowFileUnpackagerV3Reference,
    name: "FlowFile Lookup",
    shortDescription: "View information on a FlowFile's content, and attributes.",
  },
  "/unpackageFlowFileList": {
    to: "/unpackageFlowFileList",
    source: FlowFileUnpackagerV3Reference,
    name: "FlowFile List",
    shortDescription: "View information on the attributes and content of multiple FlowFiles.",
  },
  "/source": {
    to: "/source",
    source: GithubRepositoryReference,
    name: "Source Information",
    shortName: "Source",
    shortDescription: "Information on source code.",
  },
  "/tagList": {
    to: "/tagList",
    name: "Tag List",
    shortDescription: "Lists all Nar Extension Tags.",
  },
  "/mergecidrs": {
    to: "/mergecidrs",
    name: "Merge CIDRs",
    shortDescription: "Merge duplicate, overlapping and adjacent IPv4 CIDRs.",
  },
  "/mavenCoordinateResolver": {
    to: "/mavenCoordinateResolver",
    name: "Maven Artifact Resolver",
    shortDescription: "Generate URLs for downloading Maven Artifacts.",
  },
  "/pdfcombiner": {
    to: "/pdfcombiner",
    name: "PDF Combiner",
    shortDescription: "Combines multiple PDFs into a single document.",
  },
  "/githubpagesdns": {
    to: "/githubpagesdns",
    name: "GitHub Pages DNS",
    shortDescription: "Generate the DNS records for a GitHub Pages custom domain.",
    description: "Enter a repository and a domain (plus an optional subdomain) to generate the DNS records and GitHub settings needed to serve a GitHub Pages site from a custom domain.",
  },
  "/availability": {
    to: "/availability",
    name: "Availability Calculator",
    shortDescription: "Convert annual downtime into an uptime percentage, and back from common SLA targets.",
  },
  "/aistance": {
    to: "/aistance",
    name: "Stance on AI",
    shortDescription: "",
  },
}