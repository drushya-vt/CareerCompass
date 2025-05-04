"use client";

import Head from "next/head";
import WagesInAmerica from "@/components/WagesPages";
import Header from "@/components/Header";

export default function WagesPage() {
  return (
    <>
    <Header/>
      <Head>
        <title>Wages in America</title>
      </Head>
      <WagesInAmerica />
    </>
  );
}
