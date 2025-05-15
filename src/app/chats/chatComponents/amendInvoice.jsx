"use client"

import { useState, useRef } from "react"
import { X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/app/components/Modal"
import { getCities, updateInvoice } from "@/app/actions/actions"
import { VirtualizedCombobox } from "@/app/components/VirtualizedCombobox"

// Sample customer data for demonstration

export default function InvoiceAmendmentForm({ accountData, countryList, setOrderModal, chatId, userEmail }) {
  // Initialize refs for form data

  // Customer sample data for form prefill

  const [useCustomerInfo, setUseCustomerInfo] = useState(false)
  const [copyFromForm1, setCopyFromForm1] = useState(false)
  const [showAdditionalPhone, setShowAdditionalPhone] = useState(false)
  const [showAdditionalPhone2, setShowAdditionalPhone2] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [amendVisible, setAmendVisible] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState("")

  // Form refs (for uncontrolled components)
  const form1Ref = useRef({})
  const form2Ref = useRef({})

  // Countries state (for dropdown options)
  const [countries] = useState(countryList)

  // City list for customer form
  const [cityList, setCityList] = useState([])

  // Billing city list for form2
  const [billingCityList, setBillingCityList] = useState([])

  // Handle customer information autofill using sample data
  const handleUseCustomerInfo = (checked) => {
    setUseCustomerInfo(checked);

    if (checked) {
      const countryObj = countryList.find((c) => c.name === accountData?.country);
      const sampleCustomerData = {
        fullName: `${accountData?.textFirst || ''} ${accountData?.textLast || ''}`.trim(),
        country: countryObj || null, // Store full country object
        city: accountData?.city || "Tokyo",
        address: accountData?.textStreet || "123 Broadway St, Apt 4B",
        telephoneNumber: accountData?.textPhoneNumber || "555-123-4567",
        faxNumber: accountData?.faxNumber || "",
        email: accountData?.textEmail || "john.doe@example.com",
      };
      // Fill non-controlled form fields
      Object.keys(sampleCustomerData).forEach((key) => {
        if (key === "country" || key === "city") return;
        if (form1Ref.current[key] && typeof form1Ref.current[key] === "object") {
          form1Ref.current[key].value = sampleCustomerData[key] || "";
        }
      });

      // Set selected country
      const country = sampleCustomerData.country;
      setSelectedCountry(country);
      form1Ref.current.country = country;

      // Fetch cities and set selected city
      if (country && country.isoCode) {
        getCities(country.isoCode)
          .then((cities) => {
            setCityList(cities);

            const matchedCity = cities.find((c) => c.name === sampleCustomerData.city);
            const finalCity = matchedCity || sampleCustomerData.city || "";

            setTimeout(() => {
              setSelectedCity(finalCity);
              form1Ref.current.city = finalCity;
            }, 10);
          })
          .catch((err) => {
            console.error("Error fetching cities:", err);
            setCityList([]);
            setTimeout(() => {
              const fallbackCity = sampleCustomerData.city || "";
              setSelectedCity(fallbackCity);
              form1Ref.current.city = fallbackCity;
            }, 10);
          });
      }
    } else {
      // Reset form fields and state on uncheck
      Object.keys(form1Ref.current).forEach((key) => {
        if (form1Ref.current[key] && typeof form1Ref.current[key] === "object") {
          form1Ref.current[key].value = "";
        }
      });

      setSelectedCity("");
      setSelectedCountry(null);
    }
  };

  // Handle copying data from customer form (form1) to billing form (form2)
  const handleCopyFromForm1 = (checked) => {
    setCopyFromForm1(checked);
    if (checked) {

      // Copy basic text fields from Form 1 to Form 2.
      const formFields = ["fullName", "address", "telephoneNumber", "faxNumber", "email"];
      formFields.forEach(key => {
        if (
          form1Ref.current[key] &&
          form1Ref.current[key].value !== undefined &&
          form2Ref.current[key]
        ) {
          form2Ref.current[key].value = form1Ref.current[key].value;
        }
      });

      // For telephoneNumber2: if it exists and has a non-empty value,
      // ensure the additional phone input shows, and copy its value when available.
      if (
        form1Ref.current.telephoneNumber2 &&
        form1Ref.current.telephoneNumber2.value.trim() !== ""
      ) {
        setShowAdditionalPhone2(true);
        // Use a short delay to allow the billing input to render.
        setTimeout(() => {
          if (form2Ref.current.telephoneNumber2) {
            form2Ref.current.telephoneNumber2.value = form1Ref.current.telephoneNumber2.value;
          }
        }, 0);
      } else {
        setShowAdditionalPhone2(false);
      }

      // Copy country and city using state values.
      if (selectedCountry) {
        form2Ref.current.country = selectedCountry;
        setSelectedBillingCountry(selectedCountry);
        // Immediately fetch billing cities for the selected country.
        getCities(selectedCountry.isoCode)
          .then(cities => {
            setBillingCityList(cities);
            setSelectedBillingCity(selectedCity);
            form2Ref.current.city = selectedCity;
          })
          .catch(err => {
            console.error("Error fetching billing cities:", err);
            setBillingCityList([]);
          });
      }
    } else {
      // Clear Form 2 input fields (only for elements that support .value).
      Object.keys(form2Ref.current).forEach(key => {
        if (form2Ref.current[key] && typeof form2Ref.current[key].value === "string") {
          form2Ref.current[key].value = '';
        }
      });
      setSelectedBillingCountry(null);
      setSelectedBillingCity("");
      setBillingCityList([]);
      setShowAdditionalPhone2(false);
    }
  };


  // --- Form 1 (Customer Information) State ---

  // Selected country and city for customer form

  // When a country is selected in Form 1
  const handleCountrySelect = (isoCode) => {
    const country = countries.find(c => c.isoCode === isoCode)
    setSelectedCountry(country)
    // Store full country object in form1 ref
    form1Ref.current.country = country

    // Immediately fetch cities for the selected country
    getCities(country.isoCode)
      .then(cities => {
        setCityList(cities)
        setSelectedCity("")
        form1Ref.current.city = ""
      })
      .catch(err => {
        console.error("Error fetching cities:", err)
        setCityList([])
      })
  }

  const handleCitySelect = (cityValue) => {
    setSelectedCity(cityValue)
    form1Ref.current.city = cityValue
  }

  // --- Form 2 (Billing Information) State ---

  // Selected country and city for billing form
  const [selectedBillingCountry, setSelectedBillingCountry] = useState(null)
  const [selectedBillingCity, setSelectedBillingCity] = useState("")

  // When a country is selected in the billing form
  const handleBillingCountrySelect = (isoCode) => {
    const country = countries.find(c => c.isoCode === isoCode)
    setSelectedBillingCountry(country)
    form2Ref.current.country = country

    // Immediately fetch cities for the selected billing country
    getCities(country.isoCode)
      .then(cities => {
        setBillingCityList(cities)
        setSelectedBillingCity("")
        form2Ref.current.city = ""
      })
      .catch(err => {
        console.error("Error fetching billing cities:", err)
        setBillingCityList([])
      })
  }

  const handleBillingCitySelect = (cityValue) => {
    setSelectedBillingCity(cityValue)
    form2Ref.current.city = cityValue
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    // e.preventDefault()

    // Build telephone numbers array for Form 1 (customer information)
    const telephoneNumbersForm1 = [];
    if (form1Ref.current.telephoneNumber && form1Ref.current.telephoneNumber.value.trim() !== "") {
      telephoneNumbersForm1.push(form1Ref.current.telephoneNumber.value.trim());
    }
    if (form1Ref.current.telephoneNumber2 && form1Ref.current.telephoneNumber2.value.trim() !== "") {
      telephoneNumbersForm1.push(form1Ref.current.telephoneNumber2.value.trim());
    }

    // Build telephone numbers array for Form 2 (billing information)
    const telephoneNumbersForm2 = [];
    if (form2Ref.current.telephoneNumber && form2Ref.current.telephoneNumber.value.trim() !== "") {
      telephoneNumbersForm2.push(form2Ref.current.telephoneNumber.value.trim());
    }
    if (form2Ref.current.telephoneNumber2 && form2Ref.current.telephoneNumber2.value.trim() !== "") {
      telephoneNumbersForm2.push(form2Ref.current.telephoneNumber2.value.trim());
    }

    // Collect data for Form 1 (Customer Information)
    const form1Data = {
      fullName: form1Ref.current.fullName?.value,
      country: selectedCountry ? selectedCountry.name : "",
      city: selectedCity,
      address: form1Ref.current.address?.value,
      telephoneNumber: telephoneNumbersForm1, // array output
      faxNumber: form1Ref.current.faxNumber?.value,
      email: form1Ref.current.email?.value
    };

    // Collect data for Form 2 (Billing Information)
    const form2Data = {
      fullName: form2Ref.current.fullName?.value,
      country: selectedBillingCountry ? selectedBillingCountry.name : "",
      city: selectedBillingCity,
      address: form2Ref.current.address?.value,
      telephoneNumber: telephoneNumbersForm2, // array output
      faxNumber: form2Ref.current.faxNumber?.value,
      email: form2Ref.current.email?.value
    };

    console.log('Form 1 Data:', form1Data);
    console.log('Form 2 Data:', form2Data);
    const isChecked = useCustomerInfo;
    const sameAsConsignee = copyFromForm1;
    try {
      const result = await updateInvoice(form1Data, form2Data, chatId, userEmail, isChecked, sameAsConsignee);
      console.log('Server returned:', result);
      // You could then update state or display a success message, etc.
    } catch (error) {
      console.error('Error calling server action:', error);
    } finally {
      setAmendVisible(false)
    }

    // Add your submission logic here.
  };


  return (
    <>
      <Button
        onClick={() => { setAmendVisible(true) }}
        variant="default"
        className="gap-2 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
      >
        <Edit className="h-4 w-4" />
        <span>Amend Invoice</span>
      </Button>

      <Modal showModal={amendVisible} setShowModal={setAmendVisible}>
        <div className="max-h-[85vh] overflow-y-auto z-[9999]">
          <div className="container mx-auto py-6 px-4 max-w-3xl">
            {/* Customer Information Form (Form 1) */}
            <Card className="mb-6">
              <CardHeader className="border-b pb-3 sticky top-0 bg-white z-10">
                <CardTitle className="text-center text-blue-600">
                  Request Invoice Amendment
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Consignee Information</h2>

                <div className="flex items-center mb-4">
                  <Checkbox
                    id="useCustomerInfo"
                    checked={useCustomerInfo}
                    onCheckedChange={handleUseCustomerInfo}
                  />
                  <Label htmlFor="useCustomerInfo" className="ml-2">
                    Set as customer&apos;s information <span className="text-red-500">*</span>
                  </Label>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter full name"
                      ref={(el) => {
                        if (el) form1Ref.current.fullName = el
                      }}
                      defaultValue=""
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <VirtualizedCombobox
                        items={countryList}
                        value={selectedCountry ? selectedCountry.isoCode : ""}
                        onSelect={handleCountrySelect}
                        placeholder="Select Country"
                        valueKey="isoCode"
                        labelKey="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <VirtualizedCombobox
                        items={cityList}
                        value={selectedCity}
                        onSelect={handleCitySelect}
                        placeholder="Select City"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter full address"
                      ref={(el) => (form1Ref.current.address = el)}
                      defaultValue=""
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="telephoneNumber">Telephone Number</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-blue-600 border-blue-600"
                        onClick={() => setShowAdditionalPhone(true)}
                      >
                        + Add Telephone
                      </Button>
                    </div>
                    <Input
                      id="telephoneNumber"
                      placeholder="Telephone Number 1"
                      ref={(el) => (form1Ref.current.telephoneNumber = el)}
                      defaultValue=""
                    />
                    {showAdditionalPhone && (
                      <div className="mt-2 relative">
                        <Input
                          placeholder="Telephone Number 2"
                          ref={(el) => (form1Ref.current.telephoneNumber2 = el)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowAdditionalPhone(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="faxNumber">Fax Number</Label>
                    <Input
                      id="faxNumber"
                      placeholder="Enter fax number"
                      ref={(el) => (form1Ref.current.faxNumber = el)}
                      defaultValue=""
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter full email"
                      ref={(el) => (form1Ref.current.email = el)}
                      defaultValue=""
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information Form (Form 2) */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-2">Notify Party</h2>

                <div className="flex items-center mb-4">
                  <Checkbox
                    id="copyFromForm1"
                    checked={copyFromForm1}
                    onCheckedChange={handleCopyFromForm1}
                  />
                  <Label htmlFor="copyFromForm1" className="ml-2">
                    Same as consignee
                  </Label>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName2">Full Name</Label>
                    <Input
                      id="fullName2"
                      placeholder="Enter full name"
                      ref={(el) => {
                        if (el) form2Ref.current.fullName = el
                      }}
                      defaultValue=""
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country2">Country</Label>
                      <VirtualizedCombobox
                        items={countryList}
                        value={selectedBillingCountry ? selectedBillingCountry.isoCode : ""}
                        onSelect={handleBillingCountrySelect}
                        placeholder="Select Country"
                        valueKey="isoCode"
                        labelKey="name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city2">City</Label>
                      <VirtualizedCombobox
                        items={billingCityList}
                        value={selectedBillingCity}
                        onSelect={handleBillingCitySelect}
                        placeholder="Select City"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address2">Address</Label>
                    <Input
                      id="address2"
                      placeholder="Enter full address"
                      ref={(el) => {
                        if (el) form2Ref.current.address = el
                      }}
                      defaultValue=""
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="telephoneNumber2">Telephone Number</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-blue-600 border-blue-600"
                        onClick={() => setShowAdditionalPhone2(true)}
                      >
                        + Add Telephone
                      </Button>
                    </div>
                    <Input
                      id="telephoneNumber2"
                      placeholder="Telephone Number 1"
                      ref={(el) => {
                        if (el) form2Ref.current.telephoneNumber = el
                      }}
                      defaultValue=""
                    />
                    {showAdditionalPhone2 && (
                      <div className="mt-2 relative">
                        <Input
                          placeholder="Telephone Number 2"
                          ref={(el) => {
                            if (el) form2Ref.current.telephoneNumber2 = el
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowAdditionalPhone2(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="faxNumber2">Fax Number</Label>
                    <Input
                      id="faxNumber2"
                      placeholder="Enter fax number"
                      ref={(el) => {
                        if (el) form2Ref.current.faxNumber = el
                      }}
                      defaultValue=""
                    />
                  </div>
                  <div>
                    <Label htmlFor="email2">E-mail</Label>
                    <Input
                      id="email2"
                      type="email"
                      placeholder="Enter email"
                      ref={(el) => {
                        if (el) form2Ref.current.email = el
                      }}
                      defaultValue=""
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center mb-6">
              <Checkbox
                id="agreeToTerms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              />
              <Label htmlFor="agreeToTerms" className="ml-2">
                I agree to Privacy Policy and Terms of Agreement
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4 sticky bottom-0 bg-white py-4">
              <Button variant="outline" className="w-full" onClick={() => setAmendVisible(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSubmit()} className="w-full bg-blue-600 hover:bg-blue-700">
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
