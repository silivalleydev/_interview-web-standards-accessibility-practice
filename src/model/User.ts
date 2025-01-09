import moment from "moment";
import {
  size,
  filter,
  get,
  countBy,
  reduce,
  round,
  flatten,
  values,
  keys,
  toInteger,
  join,
  map,
  findIndex,
  find,
} from "lodash";

type Certificate = {
  name: string;
  issuedDate?: string;
};

export class User {
  koreanSkills?: string;
  skillsDataVersion: number;
  certificates: Certificate[];

  constructor(private seeker: any) {
    this.koreanSkills = seeker?.koreanSkills;
    this.skillsDataVersion = seeker?.skillsDataVersion;
    this.certificates = seeker?.certificates;
  }

  get original() {
    return this.seeker;
  }

  get id() {
    return this.seeker?.uid;
  }

  get ci() {
    return this.seeker?.ci !== 'unknown' ? this.seeker?.ci :'';
  }
  get device() {
    return this.seeker?.device !== 'unknown' ? this.seeker?.device :'';
  }
  get appVersion() {
    return this.seeker?.appVersion !== 'unknown' ? this.seeker?.appVersion :'';
  }

  get name() {
    return this.seeker?.username;
  }

  get isJobSuggestionAccept() {
    return this.seeker?.jobSuggestion?.isAccept || false;
  }

  get jobSuggestionLocations() {
    type Location = {
      stateName: string;
      order: number;
      displayedName: string;
      cities: string[];
    };
    let locations: Location[] = [];

    if (this.seeker?.jobSuggestion?.locations) {
      let currState: string = "";
      let currIdx: number = 0;
      this.seeker?.jobSuggestion?.locations
        .sort((a: Location, b: Location) => a.order - b.order)
        .forEach((el: Location) => {
          if (currState === el.stateName) {
            locations[currIdx]?.cities.push(el.displayedName);
          }
          if (currState !== el.stateName) {
            if (locations.length !== 0) {
              currIdx++;
            }
            currState = el.stateName;
            locations.push({
              order: el.order,
              stateName: el.stateName,
              cities: [el.displayedName],
              displayedName: "",
            });
          }
        });
    }
    return locations;
  }

  get gender() {
    return this.seeker.gender === "M" ? "남" : this.seeker.gender === "W" ? "여" : '';
  }

  get age() {
    return this.seeker.age
  }

  get birthDate() {
    return this.seeker?.birthDate;
  }

  get photo() {
    return get(this.seeker, "photo.photoURL");
  }

  get reviewCount() {
    return size(this.seeker?.reviews);
  }

  get reviews() {
    return this.seeker?.reviews;
  }

  get resumes() {
    return filter(this.seeker?.resumes, (resume) => resume.active !== false);
  }

  get skills() {

    const skillsDataVersion = this.seeker?.skillsDataVersion
    const skills = this.seeker?.skills
    let officeSkills = get(skills, "사무보조", {});
    let servingSkills = get(skills, "서빙/주방/매장관리", {});
    let laborWorkingSkills = get(skills, "단순노무/행사판촉", {});

    servingSkills =
      skillsDataVersion == 1
        ? map(flatten(values(servingSkills)), ({ skill, level }) => `${skill}${level ? " - " + level : ""}`)
        : reduce(flatten(values(servingSkills)), (skills: string[], item: object) => [...skills, ...keys(item)], []);

    officeSkills =
      skillsDataVersion === 1
        ? map(flatten(values(officeSkills)), ({ skill, level }) => `${skill}${level ? " - " + level : ""}`)
        : flatten(values(officeSkills));

    laborWorkingSkills =
      skillsDataVersion === 1
        ? map(flatten(values(laborWorkingSkills)), ({ skill, level }) => `${skill}${level ? " - " + level : ""}`)
        : "";

    return {
      사무보조: skillsDataVersion === 1 ? join(officeSkills, ", ") : JSON.stringify(officeSkills),
      "서빙/주방/매장관리": skillsDataVersion === 1 ? join(servingSkills, ", ") : JSON.stringify(servingSkills),
      "단순노무/행사판촉": skillsDataVersion === 1 ? join(laborWorkingSkills, ", ") : "",
    };
  }

  get skillCount() {
    return size(this.skills);
  }

  get registrationDate() {
    return moment(this.seeker?.createdAt).format("YYYY-MM-DD");
  }

  get membershipWithdrawalDate() {
    // return this.seeker?.leftAt ?  moment().diff(moment(this.seeker?.leftAt), 'day') >= 29 ? '' : moment(this.seeker?.leftAt).format("YYYY-MM-DD") : '';
    return this.seeker?.leftAt ? moment(this.seeker?.leftAt).format("YYYY-MM-DD") : '';
  }
  get penalty() {
    
    return this.seeker?.penalty
  }
  get leftAt() {
    
    return this.seeker?.leftAt
  }
  get penaltyDate() {
    
    return this.seeker?.penaltyDate ?moment(this.seeker?.penaltyDate).format("YYYY-MM-DD") :  ''
  }

  get idPhotoUrls() {

    if (this.seeker?.requestForPersonalVerification != "accepted") {
      return [];
    }

    const { frontSidePhotoUrl, backSidePhotoUrl } = this.seeker?.idCardPhotos || {};

    return [frontSidePhotoUrl, backSidePhotoUrl];
  }

  resumeCountByJobKind(jobKind: string) {
    return size(filter(this.seeker?.resumes, (resume) => resume.jobKind === jobKind));
  }

  reviewCountByEmployer(employerId: string) {
    const resumes = filter(this.seeker?.resumes, (resume) => resume.active && resume.employerUid === employerId);
    const resumeCount = size(resumes);

    const reviews = filter(this.seeker?.reviews, (review) => review.employerUid === employerId);
    const reviewCount = size(reviews);

    if (reviewCount > 0) {
      const rate = reduce(
        reviews,
        (result, review) => {
          result.att += review.attitudeRate || review.rate;
          result.prof += review.professionalRate || review.rate;

          return result;
        },
        { prof: 0, att: 0 }
      );
      return {
        갯수: resumeCount,
        "전문성 ": (rate.prof / reviewCount).toFixed(1),
        성실성: (rate.att / reviewCount).toFixed(1),
      };
    }

    return { 갯수: resumeCount };
  }

  get reviewAttitudeAvg() {
    const reviews = filter(this.reviews, (review) => review.attitudeRate || review.rate);

    const attRate = reduce(reviews, (sum, review) => (sum += review.attitudeRate || review.rate), 0) / reviews.length;

    return reviews.length > 0 ? round(attRate, 1) : null;
  }

  reviewCountByJobKind(jobKind: string) {
    return size(filter(this.seeker?.reviews, (review) => review.jobKind === jobKind));
  }

  get resumeCount() {
    return size(this.resumes);
  }

  get oneStarReviewCount() {
    return size(
      filter(
        this.seeker?.reviews,
        (review) => review.rate === 1 || review.attitudeRate === 1 || review.professionalRate === 1
      )
    );
  }

  get phoneNumber() {
    return this.seeker?.phoneNumber && this.seeker?.phoneNumber.replace("+82", "0");
  }

  get introduction() {
    return this.seeker?.seekerIntroduction;
  }

  get resumeCountByJobKinds() {
    const resumes = JSON.stringify(countBy(this.resumes, "jobKind")) || "";
    return resumes.replace('/"/g', "").replace("{", "").replace("}", "");
  }

  get servingResumeCount() {
    return size(filter(this.resumes, (resume) => resume.jobKind === "서빙"));
  }

  get kitchenResumeCount() {
    return size(filter(this.resumes, (resume) => resume.jobKind === "주방"));
  }

  get cardInfo() {
    const payment = this.seeker?.payment;
    return payment ? payment.cardName + " / " + payment.cardNumber : "";
  }

  get payment() {
    return this.seeker?.payment;
  }

  get reviewRate() {
    let servingCount = 0;
    let kitchenCount = 0;

    if (this.reviewCount == 0) return {};

    const rate = reduce(
      this.reviews,
      (sum, review) => {
        sum.att += review.attitudeRate || review.rate;

        if (review.jobKind === "서빙") {
          sum.serving += review.professionalRate || review.rate;
          servingCount++;
        }

        if (review.jobKind === "주방") {
          sum.kitchen += review.professionalRate || review.rate;
          kitchenCount++;
        }

        return sum;
      },
      { att: 0, serving: 0, kitchen: 0 }
    );

    return {
      att: (rate.att / this.reviewCount).toFixed(1),
      serving: servingCount ? (rate.serving / servingCount).toFixed(1) : 0,
      kitchen: kitchenCount ? (rate.kitchen / kitchenCount).toFixed(1) : 0,
    };
  }

  reviewRatingByJobkind(jobKind: string) {
    const reviewCount = size(this.seeker?.reviews);

    if (reviewCount === 0) return null;

    const reviewsByJobKind = filter(this.seeker?.reviews, (review) => review.jobKind === jobKind);

    if (reviewsByJobKind.length === 0) {
      return { att: 0, prof: 0, count: 0 };
    }

    const reviewRating = reduce(
      reviewsByJobKind,
      (result, review) => {
        result.att += toInteger(review.attitudeRate || review.rate);
        result.prof += toInteger(review.professionalRate || review.rate);

        return result;
      },
      { att: 0, prof: 0 }
    );

    return {
      att: (reviewRating.att / reviewsByJobKind.length).toFixed(1),
      prof: (reviewRating.prof / reviewsByJobKind.length).toFixed(1),
      count: reviewsByJobKind.length,
    };
  }

  get adminMemo() {
    return this.seeker?.adminMemo;
  }

  get address() {
    return [this.seeker?.seekerAddress, this.seeker?.seekerWorkplaceAddress];
  }

  get certificateToString() {
    return map(
      this.certificates,
      (certificate) => `${certificate.name}${certificate.issuedDate ? `(${certificate.issuedDate})` : ""}`
    ).join(", ");
  }

  get armyKitchenPolice() {
    const resume = find(this.resumes, (resume) => resume.jobKind === "군 복무");
    if (resume) {
      return `군 복무${resume.storeName ? "(취사병)" : ""}`;
    }

    return null;
  }
}

// export default Seeker;
